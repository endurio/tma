import {symbiosis} from "@/config"
import {useEffect} from "react"

export const useSymbiosis = () => {
    useEffect(() => {
        console.log('#symbiosis', symbiosis)
    },[])
}

