import React, { useState, useEffect } from 'react';
import {getInvestigadores} from '../api/investigadores.api';
import { InvestigadorCard } from './InvestigadorCard';

export function InvestigadoresList() {

  const [investigadores, setInvestigadores] = useState([]);

  useEffect(() => {
    async function fetchInvestigadores() {
      try {
        const res = await getInvestigadores();
        setInvestigadores(res.data);
      } catch (error) {
        console.error("Error fetching investigadores:", error);
      }
    }
    fetchInvestigadores();
  }, []);
  

  return (

    <div>

    {investigadores.map((investigador) => (
      <InvestigadorCard key={investigador.id} investigador={investigador} />
      ))
      
    }


  </div>
  );  
}; 

