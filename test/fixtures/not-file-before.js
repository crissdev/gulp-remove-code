var appVersion = '1.0.0';
//removeIf(!production)
appVersion=(+new Date().getTime()).toString();
//endRemoveIf(!production)
var appType = 'demo';
//removeIf(!demo)
appType = 'full';
//endRemoveIf(!demo)