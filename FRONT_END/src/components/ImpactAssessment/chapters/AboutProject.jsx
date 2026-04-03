
import React from 'react';
import ReportSection from '../ReportSection';
import WellLocationMap from '../WellLocationMap';
import LULCMap from '../LULCMap';
import DEMMap from '../DEMMap';
import DEMContourMap from '../DEMContourMap';
import GeomorphologyMap from '../GeomorphologyMap';
import DrainageMap from '../DrainageMap';

export const ChapterAboutProject = ({ metaData, gpId, isPrint, projectCenter, waterbodiesData }) => (
    <>
        <ReportSection>
            <thead>
                <tr><th colSpan="2">2. ABOUT THE PROJECT</th></tr>
            </thead>
            <tbody>
                <tr className="section-head"><td colSpan="2">2.1 PROJECT LOCATION AND OBSERVATION NETWORK</td></tr>
                <tr>
                    <td colSpan="2" style={{ padding: 0 }}>
                        <WellLocationMap gpId={gpId} title="Figure 1: Project Location & Observation Network" isPrint={isPrint} projectCenter={projectCenter} metaData={metaData} />
                    </td>
                </tr>

                <tr className="section-head"><td colSpan="2">2.2 LANDUSE / Land cover of the surrounding area</td></tr>
                <tr><td>LULC Classification</td><td className="val-text"></td></tr>
                <tr>
                    <td colSpan="2" style={{ padding: 0 }}>
                        <div style={{ padding: isPrint ? '5px 0' : '20px' }}>
                            <LULCMap gpId={gpId} title="Figure 2: Land Use / Land Cover Map" isPrint={isPrint} projectCenter={projectCenter} />
                        </div>
                    </td>
                </tr>

                <tr className="section-head"><td colSpan="2">2.3 DEM / Topography</td></tr>
                <tr><td>Digital Elevation Model</td><td className="val-text"></td></tr>
                <tr>
                    <td colSpan="2" style={{ padding: 0 }}>
                        <div style={{ padding: isPrint ? '5px 0' : '10px 20px' }}>
                            <DEMMap gpId={gpId} title="Figure 3: Digital Elevation Model" isPrint={isPrint} projectCenter={projectCenter} />
                            <div style={{ marginTop: isPrint ? '5px' : '20px' }}>
                                <DEMContourMap gpId={gpId} title="Figure 3A: Elevation Contour Map (10m Interval)" isPrint={isPrint} projectCenter={projectCenter} />
                            </div>
                        </div>
                    </td>
                </tr>

                <tr className="section-head"><td colSpan="2">2.4 Geomorphology and Drainage (5 Km Radius)</td></tr>
                <tr><td>Geomorphic features</td><td className="val-text"></td></tr>
                <tr><td>Drainage Density</td><td className="val-text"></td></tr>
                <tr className="sub-section-head"><td colSpan="2">2.4.1. Interpretation of Geomorphological Data</td></tr>
                <tr>
                    <td colSpan="2" className="technical-note">
                        <p style={{ margin: '8px 0', textAlign: 'justify', fontSize: '0.75rem', color: '#475569' }}>
                            The project area is characterized by an {metaData.topography} terrain. The geomorphological setup
                            primarily consists of Alluvial and Aeolian units. These features are conducive for
                            natural groundwater recharge. The dendritic drainage system effectively channels surface
                            runoff into local depressions and shallow aquifers.
                        </p>
                    </td>
                </tr>
            </tbody>
        </ReportSection>

        <section className="report-data-section">
            <div style={{ display: 'flex', flexDirection: 'column', gap: isPrint ? '5px' : '10px' }}>
                <GeomorphologyMap gpId={gpId} title="Figure 4: Geomorphology Map of Study Area" isPrint={isPrint} projectCenter={projectCenter} />
                <DrainageMap gpId={gpId} title="Figure 5: Drainage Map (5 Km Radius)" isPrint={isPrint} projectCenter={projectCenter} />
            </div>
        </section>

        <ReportSection>
            <tbody>
                <tr className="section-head"><td colSpan="2">2.5 Details of wetlands/ major Water bodies</td></tr>
                <tr><td>Wetland Status</td><td className="val-text">{waterbodiesData?.wetland_status || "No"}</td></tr>
                <tr><td>Major Water Bodies</td><td className="val-text">{waterbodiesData?.major_water_bodies || "None found within 5km radius"}</td></tr>
            </tbody>
        </ReportSection>
    </>
);
