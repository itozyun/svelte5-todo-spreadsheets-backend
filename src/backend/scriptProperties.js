const scriptProperties = PropertiesService.getScriptProperties();

// const p_scriptCache     = CacheService.getScriptCache(); // キーの長さ 250文字, 値のサイズ 100KB, 保持期限 6時間

const LATEST_UPDATED = 'latest_updated';

export {scriptProperties as default, LATEST_UPDATED}
