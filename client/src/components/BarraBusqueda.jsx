import { useState, useEffect } from "react";
import { getGrupos } from "../api/grupos.api";
import { getInvestigadores } from "../api/investigadores.api";
import { getProyectos } from "../api/proyectos.api";
import InvestigadorCard from "./InvestigadorCard"; 
import GrupoCard from "./GrupoCard";
import ProyectoCard from "./ProyectoCard";
// importar axios

export function BarraBusqueda() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState({
    investigadores: [],
    grupos: [],
    proyectos: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const [gruposRes, investigadoresRes, proyectosRes] = await Promise.all([
          getGrupos(1, 10, searchQuery),  
          getInvestigadores(1, 10, searchQuery),  
          getProyectos(1, 10, searchQuery),  
        ]);

        setResults({
          grupos: gruposRes.data.results,
          investigadores: investigadoresRes.data.results,
          proyectos: proyectosRes.data.results,
        });

        console.log("Grupos:", gruposRes.data.results);
        console.log("Investigadores:", investigadoresRes.data.results);
        console.log("Proyectos:", proyectosRes.data.results);
      } catch (error) {
        setError("Error fetching data.");
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (searchQuery) {
      fetchData();
    } else {
      setResults({ investigadores: [], grupos: [], proyectos: [] });
    }
  }, [searchQuery]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div>
      <div>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Buscar en grupos, investigadores o proyectos"
        />
      </div>

      {loading && <p>Cargando...</p>}
      {error && <p>{error}</p>}


    
      {/* Muestra los resultados  si los hay*/}
      <div>
        {/* Investigadores */}
        <h3>Investigadores</h3>
        {results.investigadores.length > 0 ? (
            results.investigadores.map((investigador) => (
                <InvestigadorCard key={investigador.id} id={investigador.id} />
            ))
            ) : (
                <p>No se encontraron investigadores.</p>
        )}


        {/* Grupos */}
        <h3>Grupos</h3>
        {results.grupos.length > 0 ? (
          results.grupos.map((grupo) => (
            <GrupoCard key={grupo.id} id={grupo.id} />
          ))
        ) : (
          <p>No se encontraron grupos.</p>
        )}

        {/* Proyectos */}
        <h3>Proyectos</h3>
        {results.proyectos.length > 0 ? (
          results.proyectos.map((proyecto) => (
            <ProyectoCard key={proyecto.id} id={proyecto.id} />
          ))
        ) : (
          <p>No se encontraron proyectos.</p>
        )}
      </div>
    </div>
  );
}

export default BarraBusqueda;
