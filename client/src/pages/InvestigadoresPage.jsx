import React from "react";
import {InvestigadoresList} from "../components/InvestigadoresList";
import { Navigation } from "../components/Navigation";
import { useParams } from 'react-router-dom';
import { InvestigadorCard } from "../components/InvestigadorCard";

export function InvestigadoresPage() {

    const { id } = useParams();
    

    return (
        <div>
          <Navigation />
          <div style={{ padding: "20px" }}>
            {id ? (
              // Si hay un ID, mostrar la información de un investigador específico
              <>
                <h1>Detalles del Investigador</h1>
                <InvestigadorCard id={id} />
              </>
            ) : (
              // Si no hay ID, mostrar la lista de investigadores
              <>
                <h1>Lista de Investigadores</h1>
                <InvestigadoresList />
              </>
            )}
          </div>
        </div>
      );
    }