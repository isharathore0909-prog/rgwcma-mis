# GEC 2015 Groundwater Assessment Formulas

This document provides a comprehensive summary of all mathematical models used for groundwater resource estimation and demand projection.

## 1. Monsoon & Non-Monsoon Recharge

| Component | Formula | Note |
| :--- | :--- | :--- |
| **Rainfall (RIF)** | `(Area * Rainfall / 1000) * RIF` | NM = 0 if NM_Rain < 10% Annual |
| **WT Fluctuation** | `(Area * SY * (Pre - Post)) + Ext - Others` | Water Balance Method (Monsoon) |
| **SW Irrigation** | `(Discharge * Hours * Days) / 10000 * RFF` | Returns flow from surface water |
| **Canal Seepage** | `WettedArea_Mm2 * Days * SeepageFactor` | ham/day/Mm2 factor |
| **Tanks/Ponds** | `Area_ha * Days * SeepageFactor` | ham/day/ha factor |
| **WCS** | `GrossStorage * 0.2 * Fillings` | Efficiency 20% |
| **Return Flow** | `Extraction (ham) * RFF` | Return flow from ground water use |

## 2. Resource Assessment & Availability

| Metric | Formula | Description |
| :--- | :--- | :--- |
| **Annual Recharge** | `Monsoon_Total + NonMonsoon_Total` | Gross annual input |
| **Natural Discharge (ND)** | `TotalRecharge * ND_Percent` | Adjustment based on levels/terrain |
| **Net GW Available** | `AnnualRecharge - NaturalDischarge` | Net Annual Availability |
| **Stage (SOE)** | `(Total_Extraction / Net_Availability) * 100` | Stage of Extraction (%) |

### Natural Discharge (ND%) Rules
- **5%**: If SY > 10%
- **10%**: If SY &le; 10%
- **15%**: If Pre-Monsoon Depth < 5m OR Terrain is **Hilly**
- **Fixed Fallback**: Measured Spring Discharge (for hilly areas)

## 3. Categorization Criteria (GEC 2015)

The categorization is primarily based on the **Stage of Extraction (SOE)**, with a secondary adjustment based on **Water Level Trends**.

| Stage of Extraction | Provisional Category |
| :--- | :--- |
| **&le; 70%** | SAFE |
| **71% - 90%** | SEMI-CRITICAL |
| **91% - 100%** | CRITICAL |
| **> 100%** | OVER-EXPLOITED |

> [!IMPORTANT]
> **Trend Adjustment**: If the significant water level trend (Slope > 0.1 m/yr) is declining in either pre-monsoon or post-monsoon, the provisional category is **downgraded by one step** (e.g., SAFE becomes SEMI-CRITICAL).

## 4. In-Storage (Static) & Confined Resources

### Unconfined Aquifer (Static)
- **Formula**: `Area * (Bottom_of_Aquifer - Pre_Monsoon_Depth) * SY`
- **Logic**: Resources stored below the dynamic pre-monsoon water table.

### Confined Aquifer Resources
- **Dynamic Resource**: `ConfinedArea * Storativity (S) * Abs(Post_Head - Pre_Head)`
- **In-Storage (Static)**: `ConfinedArea * Storativity (prev_S) * Max(0, Pre_Head - Bottom_Confining)`
- **Total**: Dynamic + In-Storage

## 5. Water Utilization & Future Allocation

- **Human Demand**: `(Population * LPCD * 365) / 10^7`
- **Livestock Demand**: `Sum(Count * Req) * 365 / 10^7`
- **Irrigation Demand**: `Sum(Area_ha * Requirement_mm / 1000)`
- **Industrial Demand**: `(Daily_L * Days) / 10^7`
- **Future Pop (25yr)**: `Current_Pop * (1 + Growth_Rate)^25`
- **Domestic Alloc (25yr)**: `(Future_Pop * LPCD * 365) / 10^7`
- **Net for Future Use**: `NetAvailable - CurrentUtil - Alloc_25yr`

## 6. Specialized Area Splits

- **Saline Proportion**: `Count(Saline Wells) / Total Wells`
- **Fresh Area**: `TotalUnitArea * (1 - SalineProportion)`
- **Saline Area**: `TotalUnitArea * SalineProportion`

---
**References**: `calculations.py`, `aquifer.py`, `MonsoonTab.jsx`, `NonMonsoonTab.jsx`, `AnnualTab.jsx`
