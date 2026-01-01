import Layout from "./Layout.jsx";

import CurrencyConverter from "./CurrencyConverter";

import EmergencyInfo from "./EmergencyInfo";

import Home from "./Home";

import LiquidChecker from "./LiquidChecker";

import PlugGuide from "./PlugGuide";

import Settings from "./Settings";

import Statistics from "./Statistics";

import TipCalculator from "./TipCalculator";

import TravelNotes from "./TravelNotes";

import TravelTools from "./TravelTools";

import TripDetails from "./TripDetails";

import Trips from "./Trips";

import UnitConverter from "./UnitConverter";

import TripSetup from "./TripSetup";

import TripItemsInput from "./TripItemsInput";

import TripAIReview from "./TripAIReview";

import TripSetupChecklist from "./TripSetupChecklist";

import TripSetupDone from "./TripSetupDone";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    CurrencyConverter: CurrencyConverter,
    
    EmergencyInfo: EmergencyInfo,
    
    Home: Home,
    
    LiquidChecker: LiquidChecker,
    
    PlugGuide: PlugGuide,
    
    Settings: Settings,
    
    Statistics: Statistics,
    
    TipCalculator: TipCalculator,
    
    TravelNotes: TravelNotes,
    
    TravelTools: TravelTools,
    
    TripDetails: TripDetails,
    
    Trips: Trips,
    
    UnitConverter: UnitConverter,
    
    TripSetup: TripSetup,
    
    TripItemsInput: TripItemsInput,
    
    TripAIReview: TripAIReview,
    
    TripSetupChecklist: TripSetupChecklist,
    
    TripSetupDone: TripSetupDone,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<CurrencyConverter />} />
                
                
                <Route path="/CurrencyConverter" element={<CurrencyConverter />} />
                
                <Route path="/EmergencyInfo" element={<EmergencyInfo />} />
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/LiquidChecker" element={<LiquidChecker />} />
                
                <Route path="/PlugGuide" element={<PlugGuide />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/Statistics" element={<Statistics />} />
                
                <Route path="/TipCalculator" element={<TipCalculator />} />
                
                <Route path="/TravelNotes" element={<TravelNotes />} />
                
                <Route path="/TravelTools" element={<TravelTools />} />
                
                <Route path="/TripDetails" element={<TripDetails />} />
                
                <Route path="/Trips" element={<Trips />} />
                
                <Route path="/UnitConverter" element={<UnitConverter />} />
                
                <Route path="/TripSetup" element={<TripSetup />} />
                
                <Route path="/TripItemsInput" element={<TripItemsInput />} />
                
                <Route path="/TripAIReview" element={<TripAIReview />} />
                
                <Route path="/TripSetupChecklist" element={<TripSetupChecklist />} />
                
                <Route path="/TripSetupDone" element={<TripSetupDone />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}