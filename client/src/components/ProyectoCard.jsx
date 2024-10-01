import React, {useState, useEffect} from 'react';
import {getGrupoById} from '../api/grupos.api';
import {getInvestigadorById} from '../api/investigadores.api';
import './ProyectoCard.css'; // Asegúrate de crear este archivo para los estilos
import { Link, useParams } from 'react-router-dom';
import { getProyectoById } from '../api/proyectos.api';


export function ProyectoCard({ id }) {
    const [grupos, setGrupos] = useState([]);
    const [investigadores, setInvestigadores] = useState([]);
    const [proyecto, setProyecto] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProyecto() {
            try {
                const res = await getProyectoById(id);
                setProyecto(res.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching proyecto:", error);
                setLoading(false);
            }finally {
                setLoading(false); 
            }

        }
        fetchProyecto();
    } , [id]);
    console.log(getProyectoById(id));

    useEffect(() => {
        async function fetchGrupos() {
            if (proyecto && proyecto.grupos && proyecto.grupos.length > 0) {
                const gruposPromises = proyecto.grupos.map(async (id) => {
                    const res = await getGrupoById(id);
                    return res.data;
                });
                const gruposData = await Promise.all(gruposPromises);
                setGrupos(gruposData);
            }
        }
        fetchGrupos();


    }, [proyecto]);


    useEffect(() => {
        async function fetchInvestigadores() {
            if (proyecto && proyecto.investigadores && proyecto.investigadores.length > 0) {
                const investigadoresPromises = proyecto.investigadores.map(async (id) => {
                    const res = await getInvestigadorById(id);
                    return res.data;
                });
                const investigadoresData = await Promise.all(investigadoresPromises);
                setInvestigadores(investigadoresData);
            }
        }
        fetchInvestigadores();
    }
    , [proyecto]);
    





    return (
        <div className="proyecto-card">
            {proyecto ? ( // Verifica si proyecto no es null
                <>
                    <div className="proyecto-header">
                        <h3>
                            <Link to={`/proyectos/${proyecto.id}`} className="proyecto-enlace">{proyecto.nombre}</Link>
                        </h3>
                        <p>{proyecto.descripcion}</p>
                    </div>
    
                    <div className="proyecto-body">
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
                                <p>No tiene grupo</p>
                            )}
                        </div>
    
                        <div className="tarjeta-lista">
                            <h4>Investigadores:</h4>
                            {investigadores.length > 0 ? (
                                investigadores.map((investigador) => (
                                    <div key={investigador.id} className="tarjeta">
                                        <p className="investigador-nombre">
                                            <a href={`/investigadores/${investigador.id}`} className="investigador-enlace">
                                                {investigador.nombre} {investigador.apellido}
                                            </a>
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p>No tiene investigadores</p>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <div>Loading...</div> // Mensaje de carga si no hay proyecto
            )}
        </div>
    );
    
};