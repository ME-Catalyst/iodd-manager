import { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Custom hook for fetching device-related data
 * Consolidates all device data fetching logic in one place
 */
export const useDeviceData = (device, API_BASE) => {
  // State for main data
  const [assets, setAssets] = useState([]);
  const [parameters, setParameters] = useState([]);
  const [errors, setErrors] = useState([]);
  const [events, setEvents] = useState([]);
  const [processData, setProcessData] = useState([]);
  const [documentInfo, setDocumentInfo] = useState(null);
  const [deviceFeatures, setDeviceFeatures] = useState(null);
  const [communicationProfile, setCommunicationProfile] = useState(null);
  const [uiMenus, setUiMenus] = useState(null);
  const [configSchema, setConfigSchema] = useState(null);
  const [xmlContent, setXmlContent] = useState('');

  // Language support
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [textData, setTextData] = useState({});

  // Phase 1-5 comprehensive IODD data
  const [processDataUiInfo, setProcessDataUiInfo] = useState([]);
  const [deviceVariants, setDeviceVariants] = useState([]);
  const [processDataConditions, setProcessDataConditions] = useState([]);
  const [menuButtons, setMenuButtons] = useState([]);
  const [wiringConfigurations, setWiringConfigurations] = useState([]);
  const [testConfigurations, setTestConfigurations] = useState(null);
  const [customDatatypes, setCustomDatatypes] = useState([]);

  // Loading states
  const [loadingXml, setLoadingXml] = useState(false);
  const [loadingErrors, setLoadingErrors] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingProcessData, setLoadingProcessData] = useState(false);

  // Fetch functions
  const fetchAssets = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${device.id}/assets`);
      setAssets(response.data);
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    }
  };

  const fetchLanguages = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${device.id}/languages`);
      setAvailableLanguages(response.data.languages || []);
      setTextData(response.data.text_data || {});
    } catch (error) {
      console.error('Failed to fetch languages:', error);
    }
  };

  const fetchProcessDataUiInfo = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${device.id}/processdata/ui-info`);
      setProcessDataUiInfo(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch process data UI info:', error);
      setProcessDataUiInfo([]);
    }
  };

  const fetchDeviceVariants = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${device.id}/variants`);
      setDeviceVariants(response.data);
    } catch (error) {
      console.error('Failed to fetch device variants:', error);
    }
  };

  const fetchProcessDataConditions = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${device.id}/processdata/conditions`);
      setProcessDataConditions(response.data);
    } catch (error) {
      console.error('Failed to fetch process data conditions:', error);
    }
  };

  const fetchMenuButtons = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${device.id}/menu-buttons`);
      setMenuButtons(response.data);
    } catch (error) {
      console.error('Failed to fetch menu buttons:', error);
    }
  };

  const fetchWiringConfigurations = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${device.id}/wiring`);
      setWiringConfigurations(response.data);
    } catch (error) {
      console.error('Failed to fetch wiring configurations:', error);
    }
  };

  const fetchTestConfigurations = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${device.id}/test-config`);
      setTestConfigurations(response.data);
    } catch (error) {
      console.error('Failed to fetch test configurations:', error);
    }
  };

  const fetchCustomDatatypes = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${device.id}/custom-datatypes`);
      setCustomDatatypes(response.data);
    } catch (error) {
      console.error('Failed to fetch custom datatypes:', error);
    }
  };

  const fetchParameters = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${device.id}/parameters`);
      setParameters(response.data);
    } catch (error) {
      console.error('Failed to fetch parameters:', error);
    }
  };

  const fetchXml = async () => {
    if (xmlContent) return; // Already loaded
    setLoadingXml(true);
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${device.id}/xml`);
      setXmlContent(response.data.xml_content);
    } catch (error) {
      console.error('Failed to fetch XML:', error);
    } finally {
      setLoadingXml(false);
    }
  };

  const fetchErrors = async () => {
    setLoadingErrors(true);
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${device.id}/errors`);
      setErrors(response.data);
    } catch (error) {
      console.error('Failed to fetch errors:', error);
    } finally {
      setLoadingErrors(false);
    }
  };

  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${device.id}/events`);
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchProcessData = async () => {
    setLoadingProcessData(true);
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${device.id}/processdata`);
      setProcessData(response.data);
    } catch (error) {
      console.error('Failed to fetch process data:', error);
    } finally {
      setLoadingProcessData(false);
    }
  };

  const fetchDocumentInfo = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${device.id}/documentinfo`);
      setDocumentInfo(response.data);
    } catch (error) {
      console.error('Failed to fetch document info:', error);
    }
  };

  const fetchDeviceFeatures = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${device.id}/features`);
      setDeviceFeatures(response.data);
    } catch (error) {
      console.error('Failed to fetch device features:', error);
    }
  };

  const fetchCommunicationProfile = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${device.id}/communication`);
      setCommunicationProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch communication profile:', error);
    }
  };

  const fetchUiMenus = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${device.id}/menus`);
      setUiMenus(response.data);
    } catch (error) {
      console.error('Failed to fetch UI menus:', error);
    }
  };

  const fetchConfigSchema = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${device.id}/config-schema`);
      setConfigSchema(response.data);
    } catch (error) {
      console.error('Failed to fetch config schema:', error);
    }
  };

  // Fetch all data on mount
  useEffect(() => {
    if (device) {
      fetchAssets();
      fetchParameters();
      fetchErrors();
      fetchEvents();
      fetchDocumentInfo();
      fetchDeviceFeatures();
      fetchCommunicationProfile();
      fetchUiMenus();
      fetchLanguages();
      // Fetch Phase 1-5 data
      fetchProcessDataUiInfo();
      fetchDeviceVariants();
      fetchProcessDataConditions();
      fetchMenuButtons();
      fetchWiringConfigurations();
      fetchTestConfigurations();
      fetchCustomDatatypes();
    }
  }, [device]);

  return {
    // Data
    assets,
    parameters,
    errors,
    events,
    processData,
    documentInfo,
    deviceFeatures,
    communicationProfile,
    uiMenus,
    configSchema,
    xmlContent,
    selectedLanguage,
    availableLanguages,
    textData,
    processDataUiInfo,
    deviceVariants,
    processDataConditions,
    menuButtons,
    wiringConfigurations,
    testConfigurations,
    customDatatypes,

    // Loading states
    loadingXml,
    loadingErrors,
    loadingEvents,
    loadingProcessData,

    // Setters for controlled state
    setSelectedLanguage,
    setXmlContent,
    setConfigSchema,
    setProcessData,

    // Fetch functions
    fetchXml,
    fetchConfigSchema,
    fetchProcessData,
  };
};
