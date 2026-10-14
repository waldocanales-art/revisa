# HAWKS · Perfil editorial alto — línea de referencia

## Alcance confirmado (14-10-2026)

El usuario validó como adecuada una revisión académica intensiva elaborada con supervisión. Se verificó el resultado en un documento DOCX de ejemplo, sin guardar el texto de las personas autoras en este repositorio:
- 439 párrafos antes y después.
- 62 párrafos reformulados en la revisión supervisada.
- 9 tablas con XML exactamente igual.
- Sin alteración de la sección de referencias ni de los anexos dentro de la intervención lingüística.

**El editor automático V8 no hizo esas 62 reformulaciones por sí mismo.** Es un corrector conservador de gramática, concisión y construcciones sintácticas seleccionadas; no reproduce automáticamente la revisión contextual profunda de un especialista. No afirmar equivalencia entre ambas modalidades.

## Criterio operativo acordado

1. Mantener **alta** como intensidad preseleccionada en la interfaz V8.
2. Proteger nombres, datos, cifras, resultados, negaciones, citas, tablas, estructura y referencias en toda transformación.
3. Ofrecer el documento DOCX resultante y el XLSX de trazabilidad, distinguiendo edición aplicada de sugerencia pendiente.
4. Reservar a **REVISa** la corrección de citas, referencias, normativa y formatos institucionales.
5. Cuando el texto requiera reorganización de argumentos, articulación entre párrafos o simplificación contextual profunda, requerir revisión y validación académica humana; no simular que la V8 automática ya lo completó.
6. No atribuir al motor ningún porcentaje de similitud Turnitin ni de escritura IA. Los informes externos son necesarios para medir esas variables.

## Regla de estabilidad

La V8 disponible en producción es la base estable. Evitar cambios del algoritmo por nuevos casos sin pruebas de no regresión en Word, tablas, citas, resultados y referencias. Toda ampliación semántica deberá probarse en una rama separada antes de desplegarse.
