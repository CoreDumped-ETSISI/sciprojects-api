import React, { useEffect, useState } from 'react';
import { getInvestigadorById } from '../api/investigadores.api'; // Asegúrate de que esta función exista
import { getGrupos } from '../api/grupos.api';
import { getProyectos } from '../api/proyectos.api';
import { Link, useParams } from 'react-router-dom';

import './InvestigadorCard.css';

export function InvestigadorCard({ id }) {
  const [investigador, setInvestigador] = useState(null);
  const [grupos, setGrupos] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInvestigador() {
      try {
        const res = await getInvestigadorById(id); // Obtener los datos del investigador
        setInvestigador(res.data);
        setLoading(false);
        setGrupos(res.data.grupos);
        setProyectos(res.data.proyectos);
      } catch (error) {
        console.error("Error fetching investigador:", error);
        setLoading(false);

      }
    }
    fetchInvestigador();
  }, [id]);

  if (loading) {
    return <p>Cargando...</p>;
  }

  if (!investigador) {
    return <p>No se encontró el investigador.</p>;
  }

  return (
    <div className="investigador-card">
      <div className="investigador-header">
        <h2 className="investigador-nombre">
            <Link to={`/investigadores/${investigador.id}`} className="investigador-enlace">
                {investigador.nombre} {investigador.apellido}
            </Link>
        </h2>
        <p className="investigador-email">{investigador.email}</p>
      </div>

      <div className="investigador-body">
        <div className="tarjeta-lista">
          <h4>Grupos:</h4>
          {grupos.length > 0 ? (
            grupos.map((grupo) => (
              <div key={grupo.id} className="tarjeta">
                <p className="grupo-nombre">
                  <a href={`/grupos/${grupo.id}`} className="grupo-enlace">{grupo.nombre}</a>
                </p>
              </div>
            ))
          ) : (
            <p>No pertenece a ningún grupo</p>
          )}
        </div>

        <div className="tarjeta-lista">
          <h4>Proyectos:</h4>
          {proyectos.length > 0 ? (
            proyectos.map((proyecto) => (
              <div key={proyecto.id} className="tarjeta">
                <p className="proyecto-nombre">
                  <a href={`/proyectos/${proyecto.id}`} className="proyecto-enlace">{proyecto.nombre}</a>
                </p>
              </div>
            ))
          ) : (
            <p>No participa en ningún proyecto</p>
          )}
        </div>
      </div>
    </div>
  );
}
