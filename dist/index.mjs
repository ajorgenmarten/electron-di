// src/index.ts
import "reflect-metadata";
function logParams(target) {
  const params = Reflect.getMetadata("design:paramtypes", target);
  console.log(params);
}
export {
  logParams
};
//# sourceMappingURL=index.mjs.map