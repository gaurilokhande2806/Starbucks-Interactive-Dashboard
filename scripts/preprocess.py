import os
import json
import urllib.request
import pandas as pd
import numpy as np

# Define URLs
DRINKS_URL = "https://raw.githubusercontent.com/reisanar/datasets/master/starbucks.csv"
STORES_URL = "https://raw.githubusercontent.com/chrismeller/StarbucksLocations/master/stores.csv"

# Define Output Paths
DATA_DIR = "e:/Projects/starbucks-dashboard/data"
DRINKS_OUT = os.path.join(DATA_DIR, "drinks.json")
STORES_SUMM_OUT = os.path.join(DATA_DIR, "stores_summary.json")
STORES_LOC_OUT = os.path.join(DATA_DIR, "stores_locations.json")

# Country Code Mapping Dictionary (ISO 2-letter code to Full English Name)
COUNTRY_MAP = {
    'US': 'United States', 'CN': 'China', 'CA': 'Canada', 'JP': 'Japan', 'KR': 'South Korea',
    'GB': 'United Kingdom', 'MX': 'Mexico', 'TW': 'Taiwan', 'TR': 'Turkey', 'PH': 'Philippines',
    'TH': 'Thailand', 'DE': 'Germany', 'MY': 'Malaysia', 'SG': 'Singapore', 'FR': 'France',
    'ES': 'Spain', 'ID': 'Indonesia', 'BR': 'Brazil', 'RU': 'Russia', 'AE': 'United Arab Emirates',
    'CL': 'Chile', 'PE': 'Peru', 'SA': 'Saudi Arabia', 'NL': 'Netherlands', 'AR': 'Argentina',
    'PL': 'Poland', 'CO': 'Colombia', 'IE': 'Ireland', 'CH': 'Switzerland', 'NZ': 'New Zealand',
    'IN': 'India', 'VN': 'Vietnam', 'BE': 'Belgium', 'RO': 'Romania', 'GR': 'Greece',
    'AT': 'Austria', 'SE': 'Sweden', 'PT': 'Portugal', 'DK': 'Denmark', 'NO': 'Norway',
    'HU': 'Hungary', 'CZ': 'Czech Republic', 'EG': 'Egypt', 'MA': 'Morocco', 'KW': 'Kuwait',
    'QA': 'Qatar', 'OM': 'Oman', 'BH': 'Bahrain', 'JO': 'Jordan', 'LB': 'Lebanon',
    'SV': 'El Salvador', 'CR': 'Costa Rica', 'PA': 'Panama', 'GT': 'Guatemala', 'HN': 'Honduras',
    'BS': 'Bahamas', 'AW': 'Aruba', 'CW': 'Curaçao', 'TT': 'Trinidad and Tobago', 'JM': 'Jamaica',
    'PR': 'Puerto Rico', 'FR': 'France', 'FI': 'Finland', 'LU': 'Luxembourg', 'SK': 'Slovakia',
    'BG': 'Bulgaria', 'CY': 'Cyprus', 'MT': 'Malta', 'IT': 'Italy', 'ZA': 'South Africa',
    'NZ': 'New Zealand', 'AU': 'Australia', 'MO': 'Macau', 'HK': 'Hong Kong', 'KH': 'Cambodia',
    'BN': 'Brunei', 'BO': 'Bolivia', 'UY': 'Uruguay', 'PY': 'Paraguay', 'EC': 'Ecuador',
    'VE': 'Venezuela', 'AD': 'Andorra', 'MC': 'Monaco', 'LI': 'Liechtenstein', 'SM': 'San Marino'
}

def clean_percent(val):
    if pd.isna(val):
        return 0.0
    val_str = str(val).replace('%', '').strip()
    try:
        return float(val_str)
    except ValueError:
        return 0.0

def clean_fat(val):
    if pd.isna(val):
        return 0.0
    val_str = str(val).strip().replace('3 2', '3.2')
    try:
        return float(val_str)
    except ValueError:
        return 0.0

def clean_text(val):
    if pd.isna(val):
        return ""
    val_str = str(val)
    # The character ords are 174 for TM (®) and 232 for è (è)
    # Ensure they are represented nicely in UTF-8
    return val_str.strip()

def preprocess():
    print("Creating data directory if not exists...")
    os.makedirs(DATA_DIR, exist_ok=True)

    # 1. PREPROCESS DRINKS
    print("Downloading drinks dataset...")
    df_drinks = pd.read_csv(DRINKS_URL)
    
    print("Cleaning drinks dataset...")
    # Fill NaN caffeine in index 158
    caff_col = df_drinks.columns[17]
    df_drinks.iloc[158, 17] = '90'
    
    # Process columns
    processed_drinks = []
    for idx, row in df_drinks.iterrows():
        # Clean caffeine
        caff_val = str(row[caff_col]).strip()
        caff_num = 0
        caff_varies = False
        if caff_val.lower() == 'varies':
            caff_num = 40  # default average for tea/varies
            caff_varies = True
            caff_display = "Varies"
        else:
            try:
                caff_num = int(float(caff_val))
                caff_display = f"{caff_num} mg"
            except ValueError:
                caff_num = 0
                caff_display = "0 mg"

        drink_item = {
            "id": idx + 1,
            "category": clean_text(row['Beverage_category']),
            "name": clean_text(row['Beverage']),
            "prep": clean_text(row['Beverage_prep']),
            "calories": int(row['Calories']),
            "fat_g": clean_fat(row[' Total Fat (g)']),
            "trans_fat_g": float(row['Trans Fat (g) ']),
            "sat_fat_g": float(row['Saturated Fat (g)']),
            "sodium_mg": int(row[' Sodium (mg)']),
            "carbs_g": int(row[' Total Carbohydrates (g) ']),
            "cholesterol_mg": int(row['Cholesterol (mg)']),
            "fiber_g": int(row[' Dietary Fibre (g)']),
            "sugar_g": int(row[' Sugars (g)']),
            "protein_g": float(row[' Protein (g) ']),
            "vitamin_a_pct": clean_percent(row['Vitamin A (% DV) ']),
            "vitamin_c_pct": clean_percent(row['Vitamin C (% DV)']),
            "calcium_pct": clean_percent(row[' Calcium (% DV) ']),
            "iron_pct": clean_percent(row['Iron (% DV) ']),
            "caffeine_mg": caff_num,
            "caffeine_display": caff_display,
            "caffeine_varies": caff_varies
        }
        processed_drinks.append(drink_item)

    print(f"Processed {len(processed_drinks)} drinks items.")
    with open(DRINKS_OUT, 'w', encoding='utf-8') as f:
        json.dump(processed_drinks, f, ensure_ascii=False, indent=2)

    # 2. PREPROCESS STORES
    print("Downloading stores dataset...")
    df_stores = pd.read_csv(STORES_URL)
    
    print("Filtering stores for BrandName == 'Starbucks'...")
    df_starbucks = df_stores[df_stores['BrandName'] == 'Starbucks'].copy()
    
    print("Removing stores with missing Latitude/Longitude...")
    df_starbucks = df_starbucks.dropna(subset=['Latitude', 'Longitude'])
    
    # Map country codes
    df_starbucks['CountryName'] = df_starbucks['CountryCode'].map(lambda x: COUNTRY_MAP.get(x, x))
    
    # Pre-aggregate store summary statistics
    total_stores = len(df_starbucks)
    countries_count = int(df_starbucks['CountryName'].nunique())
    cities_count = int(df_starbucks['City'].nunique())
    
    # Top countries
    top_countries = df_starbucks['CountryName'].value_counts()
    top_countries_list = [{"country": k, "count": int(v)} for k, v in top_countries.items()]
    
    # Top cities
    top_cities = df_starbucks['City'].value_counts().head(20)
    top_cities_list = [{"city": k, "count": int(v)} for k, v in top_cities.items()]
    
    # Ownership Types
    ownership_types = df_starbucks['OwnershipType'].value_counts()
    ownership_list = [{"type": k, "count": int(v)} for k, v in ownership_types.items()]
    
    # Top ownership name
    top_ownership = str(ownership_types.index[0]) if len(ownership_types) > 0 else "N/A"
    
    stores_summary = {
        "total_stores": total_stores,
        "countries_count": countries_count,
        "cities_count": cities_count,
        "top_ownership_type": top_ownership,
        "top_countries": top_countries_list,
        "top_cities": top_cities_list,
        "ownership_types": ownership_list
    }
    
    print(f"Processed summary: {total_stores} stores, {countries_count} countries, {cities_count} cities.")
    with open(STORES_SUMM_OUT, 'w', encoding='utf-8') as f:
        json.dump(stores_summary, f, ensure_ascii=False, indent=2)
        
    # Generate compact locations file
    # Format: [Name, City, CountryName, OwnershipType, Lat, Lon]
    compact_locations = []
    for _, row in df_starbucks.iterrows():
        compact_locations.append([
            clean_text(row['Name']),
            clean_text(row['City']),
            clean_text(row['CountryName']),
            clean_text(row['OwnershipType']),
            float(row['Latitude']),
            float(row['Longitude'])
        ])
        
    print(f"Generating compact locations list with {len(compact_locations)} items...")
    with open(STORES_LOC_OUT, 'w', encoding='utf-8') as f:
        json.dump(compact_locations, f, ensure_ascii=False)
        
    print("Preprocessing completed successfully!")

if __name__ == "__main__":
    preprocess()
