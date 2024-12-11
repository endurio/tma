
import {useAppContext} from "@/pages/IndexPage/IndexPage";
import {IConfigs} from "@/type";
import {axiosErrorEncode} from "@/utils/utils";
import axios from "axios";
import {useEffect, useState} from "react";
import configs from "@/configs/arbitrum.json"
export const useInitConfigs = () => {
    const {loadConfig, configError, configLoading} = useConfigs()
    useEffect(() => {
        loadConfig()
    },[])
    return {
        configError,
        configLoading
    }
};


export const useConfigs = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const { configs, setConfigs} = useAppContext()
    const loadConfig = async () => {
        setLoading(true)
        try {
            const config:IConfigs = (await axios.get(`https://raw.githubusercontent.com/endurio/PoR/refs/heads/dev/scripts/json/arbitrum.json`)).data
            console.log(config)
            if(setConfigs) setConfigs(config || configs)
            setLoading(false)
        } catch (error) {
            console.log(error)
            setError(axiosErrorEncode(error))
            setLoading(false)
        }
    }
  return {
    configLoading: loading,
    configError: error,
    configs,
    setConfigs,
    loadConfig,
  };
};



