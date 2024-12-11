import {useState} from "react";

export const useEndurioContract = () => {
  const [relay, setRelay] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  return {
    endurioLoading: loading,
    endurioError: error,
  };
};
