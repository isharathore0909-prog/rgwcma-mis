# Comprehensive Step-by-Step User Guide: RSGWA MIS

The **Rajasthan Ground Water Authority Management & Information System (MIS)** is a powerful decision-support tool. This guide provides an elaborate walkthrough of the 9-step workflow required to generate a high-quality **Water Security Plan (WSP)**.

---

## Phase 1: Access & Geographic Scope

### Step 1: Secure Authentication
1.  **Direct Login**: Access the portal via authorized email credentials.
2.  **Role-Based Access**: Note that your permissions (State, District, or Block level) determine which data you can modify.
3.  **Language Toggle**: For bilingual support, use the **Language** button in the top menu to switch between English and Hindi. This updates all labels, tooltips, and reports.

### Step 2: Precision Filtering
The system is hierarchical. You must select your location in order to "fetch" the relevant data records.
1.  **Filter Sequence**: Select **District** → **Block** → **Gram Panchayat (GP)**.
2.  **The Dashboard**: Once a GP is selected, the "Process Flow" cards will illuminate. Each card tracks the completion status of its respective module.

---

## Phase 2: Establishing the Baseline (Module 1)

### Step 3: Detailed GP Characterization
Click **Gram Panchayat Details**. This forms the foundation of all subsequent calculations.
1.  **GP Profile**: Define core administrative fields including the **LGD Code**, **Block Area (ha)**, and **Gram Panchayat Area (ha)**.
2.  **Hydrological Hierarchy**: Input the project's spatial context: **Watershed Name/Code**, **Sub-basin**, and **Basin** (e.g., Luni, Chambal).
3.  **Physical Characteristics**: 
    - **Hydrogeology (Terrain)**: Choose from options like Alluvial, Hard Rock, or Sedimentary.
    - **Aquifer Type**: Specify if the target aquifer is Unconfined, Semi-confined, or Confined.
4.  **Decadal Water Levels**: 
    - Input multiple years of Pre-monsoon and Post-monsoon data (in mbgl).
    - **Insight**: The system generates a trend-line chart automatically to visualize water table decline or recovery.
5.  **Chemical Analysis (WQ) Review**: 
    - The system fetches existing chemical records (pH, EC, etc.) for the GP's monitored wells.
    - **Note**: This is a **Read-Only** view used to verify the baseline water quality profile before proceeding to security planning.
6.  **Spatial Repository**: Upload mandatory GIS maps (LULC, DEM, Drainage). These are required for the Supply-Side Management modeling later.

---

## Phase 3: Hydrological Accounting (Modules 2 & 3)

### Step 4: Assessing Water Availability ("Income")
Click **Water Availability** to calculate total recharge.
1.  **Rainfall Recharge**: Use the **RIF (Rainfall Infiltration Factor)** method. Input average annual rainfall; the system calculates recharge based on local geology.
2.  **Seepage & Return Flow**: Document water entering the system from canal seepage and excess irrigation return.
3.  **Surface Water Assets**: Log the total storage capacity (mCM) of local ponds and tanks. Specify the "Annual Filling" percentage to get a realistic availability figure.

### Step 5: Mapping Water Utilization ("Expenditure")
Click **Water Utilization** to track consumption across three main sectors.
1.  **Human & Livestock (Drinking/Domestic)**: 
    - **Population Entry**: Input the **Total Human Population** and **Livestock number** (Cattle, Buffalo, Sheep, etc.).
    - **Calculations**: The system applies standard **LPCD (Litres Per Capita Day)** norms (e.g., 70 for humans) to automatically calculate the **Annual Water Requirement (ha m)**.
    - **Source Allocation**: Specify what percentage of this demand is met from **Ground Water** vs. **Surface Water**.
2.  **Agriculture (Irrigation)**: 
    - Breakdown by Season: **Rabi**, **Kharif**, and **Zaid**.
    - For each crop type, specify the area sown and the water source (Borewell vs. Open Well).
3.  **Industrial Activity**: Add individual industrial units. You must enter their specific **NOC (No Objection Certificate)** volumes for compliance tracking.

---

## Phase 4: Analytical Processing (Modules 4 & 5)

### Step 6: Visualizing the Water Balance & Quality Analytics
Click **Water Balance** to see the net result of Phase 3.
1.  **The Calculation**: Net Availability - Total Draft = **Water Balance**.
2.  **Color Coding**: 
    - **Green (Surplus)**: The GP is balanced.
    - **Red (Deficit)**: Management interventions are mandatory to restore sustainability.
3.  **WQ Analysis**: The analytical dashboard evaluates pH, TDS, Nitrate, and Fluoride against **BIS Standards**. Samples are flagged as **Safe (Green)**, **Warning (Orange)**, or **Hazardous (Red)** in the interactive charts.

### Step 7: GEC-2015 Categorization
Click **Water Budget** for the final official classification.
1.  **Stage of Extraction (SOE)**: This is the ratio of utilization to availability.
2.  **Official Categories**: 
    - **Safe** (< 70%)
    - **Semi-Critical** (70–90%)
    - **Critical** (90–100%)
    - **Over-Exploited** (> 100%)

---

## Phase 5: Strategic Planning (Modules 6 & 7)

### Step 8: Demand & Supply Side Interventions
If your GP is in the **Red (Deficit)**, you must plan fixes.
1.  **Demand Management**: Select crops for conversion to **Drip or Sprinkler** irrigation. The MIS calculates the volume of water saved (in Ha-m) compared to traditional flood irrigation.
2.  **Supply Enhancement**: Plan for **Recharge Structures** (Check Dams, Mini-Tanks, Mini-Percolation Tanks). The system uses runoff coefficients to estimate how much rain can be "harvested."

---

## Phase 6: Technical Proof & Reporting (Modules 8 & 9)

### Step 9: Technical Impact Assessment
Click **Impact Assessment** for a deep-dive technical ROI. This module is essential for statutory approvals and NOC applications.

1.  **Select Project Category**: Use the top toggle to choose between **Industry**, **Infrastructure**, or **Mining**. The forms will dynamically adjust based on the selected sector.
2.  **Project Salient Features**: Define the Project Name, NOC Application Number, Site Area, and Topography (e.g., Pediment Plain).
3.  **Tubewell Inventory**: 
    - Log both **Existing** and **Proposed** tubewells.
    - Specify mandatory parameters: Aquifer Type, Depth, Diameter, and Discharge (m³/hr).
4.  **Sector-Specific Workflows**:
    - **Mining Focus**: If 'Mining' is selected, you must complete the **Approved Mine Plan** details and input **Mine Seepage Estimations** for both Walls and Bottom (5-year period).
    - **Industry/Infra Focus**: Focus on **Water Recycling Rates** and **Treatment Technologies** (e.g., RO, STP).
5.  **Impact Modeling Review**: The system automatically generates:
    - **ROI (Radius of Influence)**: The spatial extent (in meters) where water level decline is expected.
    - **Drawdown Prediction**: The cumulative head drop expected over a 5-year operating span.
    - **Salinity Ingress**: Assessment of whether abstraction will induce saline water migration.

---

### Step 10: Finalizing the WSP Report
Click **Final Water Security Plan Report**.
1.  **Auto-Generation**: The system compiles all data into a 10-chapter, professional document.
2.  **Chapters**: GP History, Population, Hydrogeology, Water Quality Analysis, Intervention Maps, and Financial Overview.
3.  **Exporting**: Click "Go to Final Report" and press **Ctrl+P** to save as a high-resolution PDF.

---

## Troubleshooting & Best Practices
- **Data Persistence**: Always click the "Save" or "Update" button at the bottom of each tab before navigating away.
- **Form Validation**: If a form won't submit, check for fields with a **Red Asterisk (*)**.
- **Map Rendering**: For large GIS files, ensure you are using a modern browser (Chrome/Edge) with Hardware Acceleration enabled for Leaflet.

