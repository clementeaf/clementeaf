/**
 * Interfaz para una comuna
 */
export interface Commune {
  /**
   * Código de la comuna
   */
  value: string;
  /**
   * Nombre de la comuna
   */
  label: string;
}

/**
 * Interfaz para una región
 */
export interface Region {
  /**
   * Código de la región
   */
  value: string;
  /**
   * Nombre de la región
   */
  label: string;
  /**
   * Lista de comunas de la región
   */
  communes: Commune[];
}

/**
 * Lista de regiones de Chile con sus comunas
 */
export const chileRegions: Region[] = [
  {
    value: 'arica',
    label: 'Arica y Parinacota',
    communes: [
      { value: 'arica', label: 'Arica' },
      { value: 'camarones', label: 'Camarones' },
      { value: 'putre', label: 'Putre' },
      { value: 'general_lagos', label: 'General Lagos' }
    ]
  },
  {
    value: 'tarapaca',
    label: 'Tarapacá',
    communes: [
      { value: 'iquique', label: 'Iquique' },
      { value: 'alto_hospicio', label: 'Alto Hospicio' },
      { value: 'pozo_almonte', label: 'Pozo Almonte' },
      { value: 'camiña', label: 'Camiña' },
      { value: 'colchane', label: 'Colchane' },
      { value: 'huara', label: 'Huara' },
      { value: 'pica', label: 'Pica' }
    ]
  },
  {
    value: 'antofagasta',
    label: 'Antofagasta',
    communes: [
      { value: 'antofagasta', label: 'Antofagasta' },
      { value: 'mejillones', label: 'Mejillones' },
      { value: 'sierra_gorda', label: 'Sierra Gorda' },
      { value: 'taltal', label: 'Taltal' },
      { value: 'calama', label: 'Calama' },
      { value: 'ollague', label: 'Ollagüe' },
      { value: 'san_pedro_atacama', label: 'San Pedro de Atacama' },
      { value: 'tocopilla', label: 'Tocopilla' },
      { value: 'maria_elena', label: 'María Elena' }
    ]
  },
  {
    value: 'atacama',
    label: 'Atacama',
    communes: [
      { value: 'copiapo', label: 'Copiapó' },
      { value: 'caldera', label: 'Caldera' },
      { value: 'tierra_amarilla', label: 'Tierra Amarilla' },
      { value: 'chanaral', label: 'Chañaral' },
      { value: 'diego_de_almagro', label: 'Diego de Almagro' },
      { value: 'vallenar', label: 'Vallenar' },
      { value: 'alto_del_carmen', label: 'Alto del Carmen' },
      { value: 'freirina', label: 'Freirina' },
      { value: 'huasco', label: 'Huasco' }
    ]
  },
  {
    value: 'coquimbo',
    label: 'Coquimbo',
    communes: [
      { value: 'la_serena', label: 'La Serena' },
      { value: 'coquimbo', label: 'Coquimbo' },
      { value: 'andacollo', label: 'Andacollo' },
      { value: 'la_higuera', label: 'La Higuera' },
      { value: 'paiguano', label: 'Paiguano' },
      { value: 'vicuna', label: 'Vicuña' },
      { value: 'illapel', label: 'Illapel' },
      { value: 'canela', label: 'Canela' },
      { value: 'los_vilos', label: 'Los Vilos' },
      { value: 'salamanca', label: 'Salamanca' },
      { value: 'ovalle', label: 'Ovalle' },
      { value: 'combarbala', label: 'Combarbalá' },
      { value: 'monte_patria', label: 'Monte Patria' },
      { value: 'punitaqui', label: 'Punitaqui' },
      { value: 'rio_hurtado', label: 'Río Hurtado' }
    ]
  },
  {
    value: 'valparaiso',
    label: 'Valparaíso',
    communes: [
      { value: 'valparaiso', label: 'Valparaíso' },
      { value: 'casablanca', label: 'Casablanca' },
      { value: 'concon', label: 'Concón' },
      { value: 'juan_fernandez', label: 'Juan Fernández' },
      { value: 'puchuncavi', label: 'Puchuncaví' },
      { value: 'quintero', label: 'Quintero' },
      { value: 'vina_del_mar', label: 'Viña del Mar' },
      { value: 'isla_de_pascua', label: 'Isla de Pascua' },
      { value: 'los_andes', label: 'Los Andes' },
      { value: 'calle_larga', label: 'Calle Larga' },
      { value: 'rinconada', label: 'Rinconada' },
      { value: 'san_esteban', label: 'San Esteban' },
      { value: 'la_ligua', label: 'La Ligua' },
      { value: 'cabildo', label: 'Cabildo' },
      { value: 'papudo', label: 'Papudo' },
      { value: 'petorca', label: 'Petorca' },
      { value: 'zapallar', label: 'Zapallar' },
      { value: 'quillota', label: 'Quillota' },
      { value: 'calera', label: 'Calera' },
      { value: 'hijuelas', label: 'Hijuelas' },
      { value: 'la_cruz', label: 'La Cruz' },
      { value: 'limache', label: 'Limache' },
      { value: 'nogales', label: 'Nogales' },
      { value: 'olmue', label: 'Olmué' },
      { value: 'san_antonio', label: 'San Antonio' },
      { value: 'algarrobo', label: 'Algarrobo' },
      { value: 'cartagena', label: 'Cartagena' },
      { value: 'el_quisco', label: 'El Quisco' },
      { value: 'el_tabo', label: 'El Tabo' },
      { value: 'santo_domingo', label: 'Santo Domingo' },
      { value: 'san_felipe', label: 'San Felipe' },
      { value: 'catemu', label: 'Catemu' },
      { value: 'llay_llay', label: 'Llay Llay' },
      { value: 'panquehue', label: 'Panquehue' },
      { value: 'putaendo', label: 'Putaendo' },
      { value: 'santa_maria', label: 'Santa María' }
    ]
  },
  {
    value: 'metropolitana',
    label: 'Región Metropolitana',
    communes: [
      { value: 'santiago', label: 'Santiago' },
      { value: 'cerrillos', label: 'Cerrillos' },
      { value: 'cerro_navia', label: 'Cerro Navia' },
      { value: 'conchali', label: 'Conchalí' },
      { value: 'el_bosque', label: 'El Bosque' },
      { value: 'estacion_central', label: 'Estación Central' },
      { value: 'huechuraba', label: 'Huechuraba' },
      { value: 'independencia', label: 'Independencia' },
      { value: 'la_cisterna', label: 'La Cisterna' },
      { value: 'la_florida', label: 'La Florida' },
      { value: 'la_granja', label: 'La Granja' },
      { value: 'la_pintana', label: 'La Pintana' },
      { value: 'la_reina', label: 'La Reina' },
      { value: 'las_condes', label: 'Las Condes' },
      { value: 'lo_barnechea', label: 'Lo Barnechea' },
      { value: 'lo_espejo', label: 'Lo Espejo' },
      { value: 'lo_prado', label: 'Lo Prado' },
      { value: 'macul', label: 'Macul' },
      { value: 'maipu', label: 'Maipú' },
      { value: 'nunoa', label: 'Ñuñoa' },
      { value: 'pedro_aguirre_cerda', label: 'Pedro Aguirre Cerda' },
      { value: 'penalolen', label: 'Peñalolén' },
      { value: 'providencia', label: 'Providencia' },
      { value: 'pudahuel', label: 'Pudahuel' },
      { value: 'quilicura', label: 'Quilicura' },
      { value: 'quinta_normal', label: 'Quinta Normal' },
      { value: 'recoleta', label: 'Recoleta' },
      { value: 'renca', label: 'Renca' },
      { value: 'san_joaquin', label: 'San Joaquín' },
      { value: 'san_miguel', label: 'San Miguel' },
      { value: 'san_ramon', label: 'San Ramón' },
      { value: 'vitacura', label: 'Vitacura' },
      { value: 'puente_alto', label: 'Puente Alto' },
      { value: 'pirque', label: 'Pirque' },
      { value: 'san_jose_de_maipo', label: 'San José de Maipo' },
      { value: 'colina', label: 'Colina' },
      { value: 'lampa', label: 'Lampa' },
      { value: 'til_til', label: 'Tiltil' },
      { value: 'san_bernardo', label: 'San Bernardo' },
      { value: 'buin', label: 'Buin' },
      { value: 'calera_de_tango', label: 'Calera de Tango' },
      { value: 'paine', label: 'Paine' },
      { value: 'melipilla', label: 'Melipilla' },
      { value: 'alhue', label: 'Alhué' },
      { value: 'curacavi', label: 'Curacaví' },
      { value: 'maria_pinto', label: 'María Pinto' },
      { value: 'san_pedro', label: 'San Pedro' },
      { value: 'talagante', label: 'Talagante' },
      { value: 'el_monte', label: 'El Monte' },
      { value: 'isla_de_maipo', label: 'Isla de Maipo' },
      { value: 'padre_hurtado', label: 'Padre Hurtado' },
      { value: 'penaflor', label: 'Peñaflor' }
    ]
  },
  {
    value: 'ohiggins',
    label: "O'Higgins",
    communes: [
      { value: 'rancagua', label: 'Rancagua' },
      { value: 'codegua', label: 'Codegua' },
      { value: 'coinco', label: 'Coinco' },
      { value: 'coltauco', label: 'Coltauco' },
      { value: 'donihue', label: 'Doñihue' },
      { value: 'graneros', label: 'Graneros' },
      { value: 'las_cabras', label: 'Las Cabras' },
      { value: 'machali', label: 'Machalí' },
      { value: 'malloa', label: 'Malloa' },
      { value: 'mostazal', label: 'Mostazal' },
      { value: 'olivar', label: 'Olivar' },
      { value: 'peumo', label: 'Peumo' },
      { value: 'pichidegua', label: 'Pichidegua' },
      { value: 'quinta_de_tilcoco', label: 'Quinta de Tilcoco' },
      { value: 'rengo', label: 'Rengo' },
      { value: 'requinoa', label: 'Requínoa' },
      { value: 'san_vicente', label: 'San Vicente' },
      { value: 'pichilemu', label: 'Pichilemu' },
      { value: 'la_estrella', label: 'La Estrella' },
      { value: 'litueche', label: 'Litueche' },
      { value: 'marchihue', label: 'Marchihue' },
      { value: 'navidad', label: 'Navidad' },
      { value: 'paredones', label: 'Paredones' },
      { value: 'san_fernando', label: 'San Fernando' },
      { value: 'chepica', label: 'Chépica' },
      { value: 'chimbarongo', label: 'Chimbarongo' },
      { value: 'lolol', label: 'Lolol' },
      { value: 'nancagua', label: 'Nancagua' },
      { value: 'palmilla', label: 'Palmilla' },
      { value: 'peralillo', label: 'Peralillo' },
      { value: 'placilla', label: 'Placilla' },
      { value: 'pumanque', label: 'Pumanque' },
      { value: 'santa_cruz', label: 'Santa Cruz' }
    ]
  },
  {
    value: 'maule',
    label: 'Maule',
    communes: [
      { value: 'talca', label: 'Talca' },
      { value: 'constitucion', label: 'Constitución' },
      { value: 'curepto', label: 'Curepto' },
      { value: 'empedrado', label: 'Empedrado' },
      { value: 'maule', label: 'Maule' },
      { value: 'pelarco', label: 'Pelarco' },
      { value: 'pencahue', label: 'Pencahue' },
      { value: 'rio_claro', label: 'Río Claro' },
      { value: 'san_clemente', label: 'San Clemente' },
      { value: 'san_rafael', label: 'San Rafael' },
      { value: 'cauquenes', label: 'Cauquenes' },
      { value: 'chanco', label: 'Chanco' },
      { value: 'pelluhue', label: 'Pelluhue' },
      { value: 'curico', label: 'Curicó' },
      { value: 'hualane', label: 'Hualañé' },
      { value: 'licanten', label: 'Licantén' },
      { value: 'molina', label: 'Molina' },
      { value: 'rauco', label: 'Rauco' },
      { value: 'romeral', label: 'Romeral' },
      { value: 'sagrada_familia', label: 'Sagrada Familia' },
      { value: 'teno', label: 'Teno' },
      { value: 'vichuquen', label: 'Vichuquén' },
      { value: 'linares', label: 'Linares' },
      { value: 'colbun', label: 'Colbún' },
      { value: 'longavi', label: 'Longaví' },
      { value: 'parral', label: 'Parral' },
      { value: 'retiro', label: 'Retiro' },
      { value: 'san_javier', label: 'San Javier' },
      { value: 'villa_alegre', label: 'Villa Alegre' },
      { value: 'yerbas_buenas', label: 'Yerbas Buenas' }
    ]
  },
  {
    value: 'nuble',
    label: 'Ñuble',
    communes: [
      { value: 'chillan', label: 'Chillán' },
      { value: 'bulnes', label: 'Bulnes' },
      { value: 'chillan_viejo', label: 'Chillán Viejo' },
      { value: 'el_carmen', label: 'El Carmen' },
      { value: 'pemuco', label: 'Pemuco' },
      { value: 'pinto', label: 'Pinto' },
      { value: 'quillon', label: 'Quillón' },
      { value: 'san_ignacio', label: 'San Ignacio' },
      { value: 'yungay', label: 'Yungay' },
      { value: 'coelemu', label: 'Coelemu' },
      { value: 'ninhue', label: 'Ninhue' },
      { value: 'portezuelo', label: 'Portezuelo' },
      { value: 'quirihue', label: 'Quirihue' },
      { value: 'ranquil', label: 'Ránquil' },
      { value: 'trehuaco', label: 'Treguaco' },
      { value: 'cobquecura', label: 'Cobquecura' },
      { value: 'coihueco', label: 'Coihueco' },
      { value: 'niquen', label: 'Ñiquén' },
      { value: 'san_carlos', label: 'San Carlos' },
      { value: 'san_fabian', label: 'San Fabián' },
      { value: 'san_nicolas', label: 'San Nicolás' }
    ]
  },
  {
    value: 'biobio',
    label: 'Biobío',
    communes: [
      { value: 'concepcion', label: 'Concepción' },
      { value: 'coronel', label: 'Coronel' },
      { value: 'chiguayante', label: 'Chiguayante' },
      { value: 'florida', label: 'Florida' },
      { value: 'hualqui', label: 'Hualqui' },
      { value: 'lota', label: 'Lota' },
      { value: 'penco', label: 'Penco' },
      { value: 'san_pedro_de_la_paz', label: 'San Pedro de la Paz' },
      { value: 'santa_juana', label: 'Santa Juana' },
      { value: 'talcahuano', label: 'Talcahuano' },
      { value: 'tome', label: 'Tomé' },
      { value: 'hualpen', label: 'Hualpén' },
      { value: 'lebu', label: 'Lebu' },
      { value: 'arauco', label: 'Arauco' },
      { value: 'cañete', label: 'Cañete' },
      { value: 'contulmo', label: 'Contulmo' },
      { value: 'curanilahue', label: 'Curanilahue' },
      { value: 'los_alamos', label: 'Los Álamos' },
      { value: 'tirua', label: 'Tirúa' },
      { value: 'los_angeles', label: 'Los Ángeles' },
      { value: 'antuco', label: 'Antuco' },
      { value: 'cabrero', label: 'Cabrero' },
      { value: 'laja', label: 'Laja' },
      { value: 'mulchen', label: 'Mulchén' },
      { value: 'nacimiento', label: 'Nacimiento' },
      { value: 'negrete', label: 'Negrete' },
      { value: 'quilaco', label: 'Quilaco' },
      { value: 'quilaco', label: 'Quilleco' },
      { value: 'san_rosendo', label: 'San Rosendo' },
      { value: 'santa_barbara', label: 'Santa Bárbara' },
      { value: 'tucapel', label: 'Tucapel' },
      { value: 'yumbel', label: 'Yumbel' },
      { value: 'alto_biobio', label: 'Alto Biobío' }
    ]
  },
  {
    value: 'araucania',
    label: 'La Araucanía',
    communes: [
      { value: 'temuco', label: 'Temuco' },
      { value: 'carahue', label: 'Carahue' },
      { value: 'cholchol', label: 'Cholchol' },
      { value: 'cunco', label: 'Cunco' },
      { value: 'curarrehue', label: 'Curarrehue' },
      { value: 'freire', label: 'Freire' },
      { value: 'galvarino', label: 'Galvarino' },
      { value: 'gorbea', label: 'Gorbea' },
      { value: 'lautaro', label: 'Lautaro' },
      { value: 'loncoche', label: 'Loncoche' },
      { value: 'melipeuco', label: 'Melipeuco' },
      { value: 'nueva_imperial', label: 'Nueva Imperial' },
      { value: 'padre_las_casas', label: 'Padre Las Casas' },
      { value: 'perquenco', label: 'Perquenco' },
      { value: 'pitrufquen', label: 'Pitrufquén' },
      { value: 'pucon', label: 'Pucón' },
      { value: 'saavedra', label: 'Saavedra' },
      { value: 'teodoro_schmidt', label: 'Teodoro Schmidt' },
      { value: 'tolten', label: 'Toltén' },
      { value: 'vilcun', label: 'Vilcún' },
      { value: 'villarrica', label: 'Villarrica' },
      { value: 'angol', label: 'Angol' },
      { value: 'collipulli', label: 'Collipulli' },
      { value: 'curanilahue', label: 'Curacautín' },
      { value: 'ercilla', label: 'Ercilla' },
      { value: 'lonquimay', label: 'Lonquimay' },
      { value: 'los_sauces', label: 'Los Sauces' },
      { value: 'lumaco', label: 'Lumaco' },
      { value: 'purén', label: 'Purén' },
      { value: 'renaico', label: 'Renaico' },
      { value: 'traiguen', label: 'Traiguén' },
      { value: 'victoria', label: 'Victoria' }
    ]
  },
  {
    value: 'rios',
    label: 'Los Ríos',
    communes: [
      { value: 'valdivia', label: 'Valdivia' },
      { value: 'corral', label: 'Corral' },
      { value: 'lanco', label: 'Lanco' },
      { value: 'los_lagos', label: 'Los Lagos' },
      { value: 'mafil', label: 'Máfil' },
      { value: 'mariquina', label: 'Mariquina' },
      { value: 'paillaco', label: 'Paillaco' },
      { value: 'panguipulli', label: 'Panguipulli' },
      { value: 'la_union', label: 'La Unión' },
      { value: 'futrono', label: 'Futrono' },
      { value: 'lio_lio', label: 'Lago Ranco' },
      { value: 'rio_bueno', label: 'Río Bueno' }
    ]
  },
  {
    value: 'lagos',
    label: 'Los Lagos',
    communes: [
      { value: 'puerto_montt', label: 'Puerto Montt' },
      { value: 'calbuco', label: 'Calbuco' },
      { value: 'cochamo', label: 'Cochamó' },
      { value: 'fresia', label: 'Fresia' },
      { value: 'frutillar', label: 'Frutillar' },
      { value: 'los_muermos', label: 'Los Muermos' },
      { value: 'llanquihue', label: 'Llanquihue' },
      { value: 'maullin', label: 'Maullín' },
      { value: 'puerto_varas', label: 'Puerto Varas' },
      { value: 'castro', label: 'Castro' },
      { value: 'ancud', label: 'Ancud' },
      { value: 'chonchi', label: 'Chonchi' },
      { value: 'curaco_de_velez', label: 'Curaco de Vélez' },
      { value: 'dalcahue', label: 'Dalcahue' },
      { value: 'puqueldon', label: 'Puqueldón' },
      { value: 'queilen', label: 'Queilén' },
      { value: 'quellon', label: 'Quellón' },
      { value: 'quemchi', label: 'Quemchi' },
      { value: 'quinchao', label: 'Quinchao' },
      { value: 'osorno', label: 'Osorno' },
      { value: 'puerto_octay', label: 'Puerto Octay' },
      { value: 'purranque', label: 'Purranque' },
      { value: 'puyehue', label: 'Puyehue' },
      { value: 'rio_negro', label: 'Río Negro' },
      { value: 'san_juan_de_la_costa', label: 'San Juan de la Costa' },
      { value: 'san_pablo', label: 'San Pablo' }
    ]
  },
  {
    value: 'aysen',
    label: 'Aysén',
    communes: [
      { value: 'coihaique', label: 'Coihaique' },
      { value: 'lago_verde', label: 'Lago Verde' },
      { value: 'aysen', label: 'Aysén' },
      { value: 'cisnes', label: 'Cisnes' },
      { value: 'guaitecas', label: 'Guaitecas' },
      { value: 'cochrane', label: 'Cochrane' },
      { value: 'ohiggins', label: "O'Higgins" },
      { value: 'tortel', label: 'Tortel' },
      { value: 'chile_chico', label: 'Chile Chico' },
      { value: 'rio_ibanez', label: 'Río Ibáñez' }
    ]
  },
  {
    value: 'magallanes',
    label: 'Magallanes',
    communes: [
      { value: 'punta_arenas', label: 'Punta Arenas' },
      { value: 'laguna_blanca', label: 'Laguna Blanca' },
      { value: 'rio_verde', label: 'Río Verde' },
      { value: 'san_gregorio', label: 'San Gregorio' },
      { value: 'porvenir', label: 'Porvenir' },
      { value: 'primavera', label: 'Primavera' },
      { value: 'timaukel', label: 'Timaukel' },
      { value: 'natales', label: 'Natales' },
      { value: 'torres_del_paine', label: 'Torres del Paine' }
    ]
  }
];

/**
 * Obtiene las comunas de una región
 * @param regionValue - Código de la región
 * @returns Lista de comunas de la región
 */
export const getCommunesByRegion = (regionValue: string): Commune[] => {
  const region = chileRegions.find(r => r.value === regionValue);
  return region ? region.communes : [];
};

/**
 * Obtiene todas las regiones
 * @returns Lista de regiones
 */
export const getAllRegions = (): Array<{ value: string; label: string }> => {
  return chileRegions.map(r => ({ value: r.value, label: r.label }));
};

