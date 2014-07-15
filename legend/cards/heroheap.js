var Weapon = require("../../legend/weapon.js");
var Skill = require("../../legend/skill.js");
var HeroCard = require("../../legend/cards/herocard.js");
var Weapon = require("../../legend/weapon.js");
var context = require("../../legend/context.js");
var util = require("../../util.js");

var HeroHeap = [];

HeroHeap.push(new HeroCard('hero5', "玛法里奥·怒风", "德鲁伊", "", 30,
		null, new Skill("变形", "在本回合中，+1攻击力，+1护甲值。", 2, false, function(player) {
			player.hero.attack_add(1);
			player.hero.guard_add(1);
		})));
HeroHeap.push(new HeroCard('hero6', "吉安娜·普罗德摩尔", "法师", "", 30, null, new Skill("火焰冲击",
		"造成1点伤害。", 2, true, function(player, target) {
			target.blood_cut(1);
		})));
HeroHeap.push(new HeroCard('hero4', "雷克萨", "猎人", "", 30, null, new Skill("稳固射击",
		"对敌方英雄造成2点伤害。", 2, false, function(player, target) {
			player.enemy.hero.blood_cut(2);
		})));
HeroHeap.push(new HeroCard('hero9', "安度因·乌瑞恩", "牧师", "", 30, null, new Skill("次级治疗",
		"恢复2点生命值。", 2, true, function(player, target) {
			target.blood_add(2);
		})));
HeroHeap.push(new HeroCard('hero2', "瓦莉拉·萨古纳尔", "潜行者", "", 30, null, new Skill("匕首精通",
		"装备一把1/2的匕首。", 2, false, function(player, target) {
			var weapon = new Weapon("匕首", 1, 2, []);
			player.hero.weapon_add(weapon);
		})));
HeroHeap.push(new HeroCard('hero3', "萨尔", "萨满", "", 30, null, new Skill("图腾召唤",
		"随机召唤一个图腾。", 2, false, function(player, target) {
			var cs = [ "石爪图腾", "空气之怒图腾", "治疗图腾", "灼热图腾" ]
			var name = util.random(cs);
			var card = context.CardHeap.find(name);
			if (card) {
				card.cost = 0;
				card.use(player);
			}
		})));
HeroHeap.push(new HeroCard('hero1', "乌瑟尔·光明使者", "圣骑士", "", 30, null, new Skill("援军",
		"召唤一个1/1的白银之手新兵。", 2, false, function(player, target) {
			var card = context.CardHeap.find("白银之手新兵");
			if (card) {
				card.cost = 0;
				card.use(player);
			}
		})));
HeroHeap.push(new HeroCard('hero8', "加尔鲁什·地狱咆哮", "战士", "", 30, null, new Skill("全副武装",
		"获得2点护甲值。", 2, false, function(player, target) {
			player.hero.guard_add(2);
		})));
HeroHeap.push(new HeroCard('hero7', "古尔丹", "术士", "", 30, null, new Skill("生命分流",
		"抽一张牌并受到2点伤害。", 2, false, function(player, target) {
			player.hero.blood_cut(2);
			player.card_pick();
		})));

HeroHeap.otherHeros = [];
HeroHeap.otherHeros.push(new HeroCard('', "加拉克苏斯大王", "术士", "恶魔", 30, new Weapon(
		"血怒", 3, 8, []), new Skill("地狱火！", "召唤一个6/6的地狱火。", 2, false, function(
		player, target) {
	var card = context.CardHeap.find("地狱火");
	if (card) {
		card.cost = 0;
		card.use(player);
	}
})));

HeroHeap.baseCards = {};
HeroHeap.baseCards["牧师"] = [ "神圣惩击", "真言术：盾", "巫医", "血沼迅猛龙", "心灵震爆", "北郡牧师",
		"森金持盾卫士", "暗言术：痛", "冰风雪人", "熔火恶犬", "精灵弓箭手", "霜狼步兵", "古拉巴什狂暴者",
		"破碎残阳祭司", "银背雌猩猩" ];
HeroHeap.baseCards["战士"] = [ "石拳食人魔", "冲锋", "斩杀", "炽炎战斧", "英勇打击", "鱼人袭击者",
		"森金持盾卫士", "战歌指挥官", "狼骑兵", "机械幼龙技工", "霜狼步兵", "古拉巴什狂暴者", "竞技场主宰",
		"鱼人猎潮者", "剃刀猎手" ];
HeroHeap.baseCards["术士"] = [ "吸取生命", "地狱烈焰", "鱼人袭击者", "鲁莽火箭兵", "淡水鳄", "暗影箭",
		"魅魔", "虚空行者", "巫医", "狼骑兵", "冰风雪人", "暗鳞治愈者", "狗头人地卜师", "食人魔法师", "作战傀儡" ];
HeroHeap.baseCards["法师"] = [ "魔爆术", "奥术智慧", "奥术飞弹", "血沼迅猛龙", "石拳食人魔", "火球术",
		"鱼人袭击者", "夜刃刺客", "工程师学徒", "绿洲钳嘴龟", "变形术", "淡水鳄", "森金持盾卫士", "狼骑兵",
		"团队领袖" ];
HeroHeap.baseCards["德鲁伊"] = [ "血沼迅猛龙", "石拳食人魔", "爪击", "治疗之触", "激活", "野性印记",
		"夜刃刺客", "绿洲钳嘴龟", "淡水鳄", "石牙野猪", "野性成长", "熔火恶犬", "精灵弓箭手", "竞技场主宰",
		"银背雌猩猩" ];
HeroHeap.baseCards["猎人"] = [ "奥术射击", "血沼迅猛龙", "驯兽师", "工程师学徒", "绿洲钳嘴龟", "团队领袖",
		"淡水鳄", "石牙野猪", "森林狼", "追踪术", "熔火恶犬", "闪金镇步兵", "铁鬃灰熊", "剃刀猎手" ];
HeroHeap.baseCards["圣骑士"] = [ "力量祝福", "愤怒之锤", "保护之手", "圣光术", "圣光的正义", "工程师学徒",
		"团队领袖", "精灵弓箭手", "侏儒发明家", "闪金镇步兵", "铁炉堡火枪手", "竞技场主宰", "雷矛特种兵", "暴风城骑士",
		"暴风城勇士" ];
HeroHeap.baseCards["潜行者"] = [ "刺杀", "背刺", "血沼迅猛龙", "石拳食人魔", "致命药膏", "夜刃刺客",
		"工程师学徒", "闷棍", "影袭", "机械幼龙技工", "精灵弓箭手", "侏儒发明家", "闪金镇步兵", "铁炉堡火枪手",
		"雷矛特种兵" ];
HeroHeap.baseCards["萨满"] = [ "先祖治疗", "冰霜震击", "妖术", "鱼人袭击者", "团队领袖", "鲁莽火箭兵",
		"石化武器", "森金持盾卫士", "石牙野猪", "巫医", "风怒", "狼骑兵", "藏宝海湾保镖", "霜狼步兵", "霜狼督军" ];

module.exports = HeroHeap;