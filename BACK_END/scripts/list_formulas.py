import os

def list_formulas():
    print("="*70)
    print("MIS RSGWA - COMPREHENSIVE GEC 2015 & WATER UTILIZATION FORMULAS")
    print("="*70)
    
    formulas = [
        {
            "category": "1. RECHARGE COMPONENTS (MONSOON)",
            "items": [
                ("Rainfall RIF Method", "Recharge = Area (ha) * Normal Monsoon Rainfall (m) * RIF Factor"),
                ("WT Fluctuation (Raw)", "Recharge = (Area * Specific Yield * Fluctuation) + Extraction - Others"),
                ("SW Irrigation", "Recharge = (Avg Discharge * Pumping Hours * Days / 10000) * RFF"),
                ("Canal Seepage", "Recharge = Wetted Area (Million m2) * Days * Seepage Factor"),
                ("Tanks & Ponds", "Recharge = Spread Area (ha) * Days * Seepage Factor"),
                ("Water Cons. Structures", "Recharge = Gross Storage (ham) * 0.2 (Efficiency) * Fillings"),
                ("Urban Pipelines", "Recharge = Pipeline Losses (ham) * 0.5 (Recharge Factor)")
            ]
        },
        {
            "category": "2. RECHARGE COMPONENTS (NON-MONSOON)",
            "items": [
                ("Rainfall RIF Method", "Recharge = Area * NM_Rainfall * RIF (0 if NM_Rain < 10% Annual)"),
                ("Return Flow (GW/SW)", "Recharge = Draft (ham) * Return Flow Factor (RFF)"),
                ("Canal Seepage (NM)", "Recharge = Wetted Area * Days_NM * Seepage Factor"),
                ("Tanks & Ponds (NM)", "Recharge = Area_NM * Days_NM * Recharge Factor"),
                ("WCS (NM)", "Recharge = Storage_NM * Recharge Factor")
            ]
        },
        {
            "category": "3. IN-STORAGE (STATIC) & CONFINED RESOURCES",
            "items": [
                ("Static (Unconfined)", "Area * (Bottom_of_Aquifer - Pre_Monsoon_Depth) * SY"),
                ("Dynamic Confined", "Confined_Area * Storativity (S) * Abs(Post_Head - Pre_Head)"),
                ("In-Storage Confined", "Static = Confined_Area * S * Max(0, Pre_Head - Bottom_Confining)"),
                ("Total Confined", "Total = Dynamic Confined + In-Storage Confined"),
                ("Aquifer Bottom", "Bottom (AMSL) vs Piezometric Heads (AMSL) determines thickness")
            ]
        },
        {
            "category": "4. RESOURCE ASSESSMENT & CATEGORIZATION",
            "items": [
                ("Total Annual Recharge", "Total = Monsoon_Total + Non_Monsoon_Total"),
                ("Natural Discharge (ND)", "ND = Total Recharge * ND_Percent (5%, 10%, or 15%)"),
                ("Net GW Available", "Available = Total Recharge - Natural Discharge"),
                ("Stage of Extraction", "SOE (%) = (Total Extraction / Total GW Available) * 100"),
                ("Base Category", "SAFE (<=70), SEMI-CRITICAL (70-90), CRITICAL (90-100), OE (>100)"),
                ("Trend Adjustment", "If Trend > 0.1 m/yr decline, category is downgraded by 1 level")
            ]
        },
        {
            "category": "5. WATER UTILIZATION & DEMAND",
            "items": [
                ("Human Demand", "Annual (ham) = (Population * LPCD * 365) / 10,000,000"),
                ("Livestock Demand", "Annual (ham) = Sum(Count * Req_L) * 365 / 10,000,000"),
                ("Irrigation Demand", "Annual (ham) = Sum(Area * Requirement_mm / 1000)"),
                ("Industrial Demand", "Annual (ham) = (Daily_L * Days) / 10,000,000")
            ]
        },
        {
            "category": "6. FUTURE ALLOCATION PROJECTION (25 YEARS)",
            "items": [
                ("Future Pop Projection", "P_future = P_current * (1 + Growth_Rate)^25"),
                ("25yr Domestic Alloc.", "Alloc_25yr (ham) = (P_future * LPCD * 365) / 10,000,000"),
                ("Net for Future Use", "Net = Net_Available - Current_Util - Alloc_25yr")
            ]
        },
        {
            "category": "7. AREA ADJUSTMENTS",
            "items": [
                ("Saline Proportion", "Prop = Count(Saline Wells) / Total Wells"),
                ("Fresh Area ha", "Fresh_Area = Total_Area * (1 - Saline Proportion)"),
                ("Saline Area ha", "Saline_Area = Total_Area * Saline Proportion")
            ]
        }
    ]

    for cat in formulas:
        print(f"\n[ {cat['category']} ]")
        for name, formula in cat['items']:
            print(f"  • {name:<25} : {formula}")

    print("\n" + "="*70)
    print("Sources: calculations.py | aquifer.py | MonsoonTab.jsx | AnnualTab.jsx")
    print("="*70)

if __name__ == "__main__":
    list_formulas()
