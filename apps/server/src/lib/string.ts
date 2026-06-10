// Auto rename with index. For example, if the new name is "file(1).txt" and the local names are ["file.txt", "file(1).txt"], the function will return "file(2).txt".
export function autoRenameWithIndex(newName: string, localNames: string[]) {
  const reg = /([\w\W]*)\((\d+)\)$/;
  const r1 = reg.exec(newName);
  const pureName1 = r1?.[1] || newName;
  let maxIndex = 0;
  for (const t of localNames) {
    const r2 = reg.exec(t);
    const pureName2 = r2?.[1] || t;
    let index2 = 0;
    if (pureName2 === pureName1) {
      index2 = Number(r2?.[2] || 0) + 1;
    }
    if (index2 > maxIndex) {
      maxIndex = index2;
    }
  }
  const index1 = maxIndex + 1;
  return index1 > 1 ? `${pureName1}(${index1 - 1})` : pureName1;
}
