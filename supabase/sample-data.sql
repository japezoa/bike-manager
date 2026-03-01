-- Datos de ejemplo para probar la aplicación
-- Ejecuta este script DESPUÉS de ejecutar schema.sql

-- Bicicleta 1: Cannondale Catalyst 4
INSERT INTO public.bicycles (
    name,
    model,
    frame,
    geometry,
    fork,
    transmission,
    brakes,
    wheels,
    components,
    maintenance_history,
    purchase_date,
    purchase_price,
    purchase_condition,
    total_kilometers
) VALUES (
    'Amante 2',
    'Cannondale Catalyst 4 (Talla M – Aro 27.5)',
    'SmartForm C3 Alloy, conificado, aluminio liviano',
    'Deportiva urbana y MTB recreativo, ideal para principiantes',
    'Horquilla Suntour 27.5" XCM RL DS 120mm 9x100mm Negro',
    '{"speeds": "1×11", "shifter": "Shimano SL-M5100", "chain": "Shimano CN-HG601", "crankset": "Shimano Deore FC-M5100-1 32T 170mm", "bottomBracket": "Shimano BB-MT501", "rearDerailleur": "Shimano Deore RD-M5100-SGS", "cassette": "Shimano CS-M5100-11 11-51T"}'::jsonb,
    '{"type": "Disco mecánico MT200", "model": "MT200", "rotorSize": "160mm"}'::jsonb,
    '{"wheelSize": "27.5\"", "tires": "Maxxis Crossmark II 27.5×2.1", "frontRim": "DC 6.0, Double Wall", "frontHub": "Disco de aleación, QR, 32h", "rearRim": "Weinmann 27.5 U28 Tl Negra 32H Fv", "rearHub": "ARC MT009 MTB HG 8-12v"}'::jsonb,
    '{"handlebar": "Aleación, aumento de 25mm, 700mm, 31.8", "stem": "Aleación, 31.8, 8°", "seatpost": "Aleación microajuste 27.2×350mm", "saddle": "Cannondale Etapa 2", "pedals": ""}'::jsonb,
    '[
        {"date": "2026-02-14", "description": "Cambio Maxxis Crossmark II 27.5×2.1", "cost": 0},
        {"date": "2025-10-21", "description": "Upgrade: Transmisión completa, frenos, horquilla, rueda trasera, maza trasera", "cost": 480000}
    ]'::jsonb,
    '2023-03-05',
    160000,
    'used',
    970
);

-- Bicicleta 2: Merida Big Seven 20
INSERT INTO public.bicycles (
    name,
    model,
    frame,
    geometry,
    fork,
    transmission,
    brakes,
    wheels,
    components,
    maintenance_history,
    purchase_date,
    purchase_price,
    purchase_condition
) VALUES (
    'Amante 4',
    'Merida Big Seven 20 (White/Purple) 27.5" – Modelo 2022',
    'Big­Seven TFS III, aluminio doble butted, ejes 135×9mm, pedalier BSA',
    'Ruedas 27.5″, posición más erguida para mayor comodidad urbana y mejor visibilidad',
    'SR Suntour XCT30 HLO, 100mm con bloqueo frontal',
    '{"speeds": "3×8", "shifter": "Shimano ST‑EF505", "chain": "Sunrace M84", "crankset": "Shimano TY301 (42‑34‑24T)", "bottomBracket": "FSA TH‑7420ST‑W", "rearDerailleur": "Shimano RD‑M360", "frontDerailleur": "Shimano FD‑TY700", "cassette": "Sunrace 11‑32T"}'::jsonb,
    '{"type": "Disco hidráulico", "model": "Power DS100 (2 pistones)", "rotorSize": "160mm"}'::jsonb,
    '{"wheelSize": "27.5\"", "tires": "Kenda K1080 27.5×2.2\"", "frontRim": "Merida CC 32h", "frontHub": "Shimano TX505 con cierre rápido", "rearRim": "Merida CC 32h", "rearHub": "Shimano TX505 con cierre rápido"}'::jsonb,
    '{"handlebar": "Merida CC, 690mm ancho con rise de 15mm", "stem": "Merida CC 31.8mm", "seatpost": "Merida CC 30.9mm, setback de 15mm", "saddle": "Merida Sport Comfort", "pedals": "VP VPE‑891"}'::jsonb,
    '[]'::jsonb,
    '2025-07-01',
    330000,
    'new'
);

-- Bicicleta 3: Faucon Volga
INSERT INTO public.bicycles (
    name,
    model,
    frame,
    geometry,
    fork,
    transmission,
    brakes,
    wheels,
    components,
    maintenance_history,
    purchase_date,
    purchase_price,
    purchase_condition
) VALUES (
    'Amante 3',
    'Faucon Volga (Aro 29 – Color negro)',
    'Faucon MTB de aluminio (modelo Volga)',
    'Geometría urbana/MTB recreacional, enfoque híbrido entre confort y postura deportiva',
    'Suspensión básica de resorte, 60-75mm de recorrido',
    '{"speeds": "3×7", "shifter": "Shimano EF41", "chain": "Genérica 7 velocidades", "crankset": "Genérica triple plato (42/34/24)", "bottomBracket": "Genérico", "rearDerailleur": "Shimano Tourney", "frontDerailleur": "Shimano Tourney TZ500", "cassette": "14–28T, 7 velocidades"}'::jsonb,
    '{"type": "Disco mecánico", "model": "Genérico", "rotorSize": "160mm"}'::jsonb,
    '{"wheelSize": "29\"", "tires": "Olimpus 29×2.1 (52-622)", "frontRim": "Aleación doble pared", "frontHub": "Genérica QR", "rearRim": "Aleación doble pared", "rearHub": "Genérica QR"}'::jsonb,
    '{"handlebar": "Recto de aleación, 660mm aprox.", "stem": "Aleación 7–10°", "seatpost": "Aleación 27.2mm", "saddle": "Ergonómico básico", "pedals": "Plataforma plástica"}'::jsonb,
    '[
        {"date": "2024-11-14", "description": "Cambio neumático trasero y desviador trasero Shimano Tourney", "cost": 37000}
    ]'::jsonb,
    '2024-11-12',
    60000,
    'used'
);
