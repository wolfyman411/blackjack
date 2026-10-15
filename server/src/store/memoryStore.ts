import type { Player } from "../game/player.ts";
import type { Gamestate } from "../game/view.ts";

export var activeGames = new Map<string,Gamestate>()
export var activePlayers = new Map<string,Player>()