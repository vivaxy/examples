/**
 * @since 2020-03-08 17:45:41
 * @author vivaxy
 */
import * as vlq from '@vivaxy/vlq';

export default function parse(sourceMap: any) {
  const result = [];
  let currentDistColumn = 0;
  let currentSrcLine = 0;
  let currentSrcColumn = 0;
  let currentNameIndex = 0;
  const lines = sourceMap.mappings.split(';');
  for (let distLine = 0; distLine < lines.length; distLine++) {
    const line = lines[distLine];
    const rows = line.split(',');
    for (const row of rows) {
      const [
        distColumn,
        sourcesIndex,
        srcLine = 0,
        srcColumn = 0,
        namesIndex = 0,
      ] = vlq.decode(row);
      const srcFileName = sourceMap.sources[sourcesIndex];
      currentSrcLine += srcLine;
      currentSrcColumn += srcColumn;
      currentDistColumn += distColumn;
      currentNameIndex += namesIndex;
      result.push({
        distLine: distLine + 1,
        distColumn: currentDistColumn + 1,
        srcLine: currentSrcLine + 1,
        srcColumn: currentSrcColumn + 1,
        srcFileName,
        name: sourceMap.names[currentNameIndex],
      });
    }
  }
  return result;
}
