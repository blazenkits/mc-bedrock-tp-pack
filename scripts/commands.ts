import { Player, world, Vector3 } from "@minecraft/server";
import * as config from "./config";
import { MinecraftDimensionTypes } from "@minecraft/vanilla-data";

// Useful interfaces
export interface DimensionedVector3 extends Vector3 {
  d: string
}

export enum Commands {
  INVALID,
  TP,
  SETHOME,
  HOME,
  RESTART,
  SHOWERR,
  BACK
}

export interface CommandData {
  player: Player
  messageComponents: string[]
  command: Commands
}

export function getCommand(tag: string): Commands {
  switch (tag) {
    case ".home":
    case "!home":
      return Commands.HOME
    case ".tp":
    case "!tp":
      return Commands.TP
    case ".sethome":
    case "!sethome":
      return Commands.SETHOME
    case ".restart":
    case "!restart":
      return Commands.RESTART
    case ".back":
    case "!back":
      return Commands.BACK
    default:
      return Commands.INVALID
  }
}

export function processCustomCommands(eventData: CommandData) {
  let messageComponents = eventData.messageComponents
  let player = eventData.player
  try {
    if (messageComponents.length == 0) return;
    switch (eventData.command) {
      case Commands.TP: {
        if (!config.WorldConfigs.TP_ENABLE) return;
        if (messageComponents.length != 2) {
          player.sendMessage(`tp > 사용법 '.tp <playername>'`);
          sendPlayerListMessage(player);
          return;
        }
        for (let target of world.getAllPlayers()) {
          if (target.name == messageComponents[1]) {
            
            setLastTPPosition(player)
            let tpSuccess = player.tryTeleport(target.location, { dimension: target.dimension });
            if (tpSuccess) {
              player.sendMessage(`tp > ${target.name}에게 소환되었습니다.`);
              target.sendMessage(`${player.name}이 당신에게 소환되었습니다.`)
              player.addLevels(-config.WorldConfigs.TP_CLEAR_LEVELS_AMOUNT);
              if(player.level < 0){
                player.resetLevel()
              }
            } else {
              player.sendMessage(`tp > ${target.name}는 현재 소환할 수 있는 위치가 아닙니다.`);
            }
            return;
          }
        }
        player.sendMessage(`tp > 이름 ${messageComponents[1]}은 유효하지 않습니다.`);
        sendPlayerListMessage(player);
        return;
      }

      case Commands.SETHOME: {
        
        if (!config.WorldConfigs.HOME_ENABLE) return;
        if (player.dimension.id != "minecraft:overworld") {
          player.sendMessage(`sethome > 홈 설정은 오버월드에서만 가능합니다.`);
          return;
        }
        let hlScoreboard = world.scoreboard.getObjective(config.HOME_LOCATION_SCOREBOARD);

        // Initialize scoreboards if not present.
        if (!hlScoreboard) {
          hlScoreboard = world.scoreboard.addObjective(config.HOME_LOCATION_SCOREBOARD, "Home-Location");
        }

        hlScoreboard.setScore(player.id + 'x', player.location.x);
        hlScoreboard.setScore(player.id + 'y', player.location.y);
        hlScoreboard.setScore(player.id + 'z', player.location.z);

        player.sendMessage(`sethome > 성공!`);
        return;
      }

      case Commands.HOME: {
        
        if (!config.WorldConfigs.HOME_ENABLE) return;
        let hlScoreboard = world.scoreboard.getObjective(config.HOME_LOCATION_SCOREBOARD);

        if (!hlScoreboard) {
          player.sendMessage(`home > 집 위치가 설정되지 않았습니다.`);
          return;
        }
        let px = hlScoreboard.getScore(player.id + 'x');
        let py = hlScoreboard.getScore(player.id + 'y');
        let pz = hlScoreboard.getScore(player.id + 'z');
        if (px != undefined && py != undefined && pz != undefined) {
          setLastTPPosition(player)
          let tpSuccess = player.tryTeleport(
            { x: px, y: py, z: pz },
            { dimension: world.getDimension(MinecraftDimensionTypes.Overworld) }
          );
          if (tpSuccess) {
            player.addLevels(-config.WorldConfigs.TP_CLEAR_LEVELS_AMOUNT);
            if(player.level < 0){
              player.resetLevel()
            }
            player.sendMessage(`home > 집으로 소환되었습니다.`);
          } else {
            player.sendMessage(`home > 집은 현재 소환할 수 있는 위치가 아닙니다.`);
          }
          return;
        }

        player.sendMessage(`home > 오류`);
        return;
      }

      case Commands.RESTART : {
        if (!isOp(player)){
          player.sendMessage(`restart > Operator권한을 가진 사용자만 가능합니다.`);
          return
        }
        if(messageComponents.length == 2 && messageComponents[1] == "default"){
          player.sendMessage(`restart default > 월드 변수가 초기화되었습니다.`);
          world.scoreboard.removeObjective(config.WORLD_CONFIG_SCOREBOARD)
        }
        restartScript()
        return
      }


      case Commands.BACK : {
        if (!config.WorldConfigs.TP_ENABLE) return;
        if (messageComponents.length != 1) {
          player.sendMessage(`back: 소환 전 장소로 되돌아갑니다.`);
          return;
        }
        if (player.id in lastTPPosition){
          let p = lastTPPosition[player.id];
          setLastTPPosition(player)
          let tpSuccess = player.tryTeleport({x: p.x, y: p.y, z: p.z}, { dimension: world.getDimension(p.d) });
          if (tpSuccess) {
            player.sendMessage(`원래 위치로 돌아왔습니다.`);
            player.addLevels(-config.WorldConfigs.TP_CLEAR_LEVELS_AMOUNT);
            if(player.level < 0){
              player.resetLevel()
            }
            return;
          }
        }
        else {
              player.sendMessage(`최근 소환을 사용한 적이 없습니다!.`);
              return;
        }
        player.sendMessage(`버그가 발생했습니다.`);
        return;
      }
    }
  } catch (e) {
      if(e instanceof Error) console.log(e)
  }
}

export function restartScript(){
    
    world.sendMessage(`server > 재시작합니다.`)
    let wcScoreboard = world.scoreboard.getObjective(config.WORLD_CONFIG_SCOREBOARD);
    // Initialize scoreboards if not present.
    if (!wcScoreboard) {
      wcScoreboard = world.scoreboard.addObjective(config.WORLD_CONFIG_SCOREBOARD, "World-Configs");
      for(let s in config.WorldConfigs){
        wcScoreboard.setScore(s, config.WorldConfigs[s])
      }
    } else {
      for(let s of wcScoreboard.getScores()){
        let n = s.participant.displayName
        if (n in config.WorldConfigs){
          config.WorldConfigs[n] = s.score
          world.sendMessage(`server > WorldConfigs set ${n} to ${s.score}.`)
        }
      }
    }

}

function isOp(player: Player){
  return player.isOp()
}

function sendPlayerListMessage(player: Player) {
  player.sendMessage("접속중인 사용자:");
  world.getAllPlayers().forEach((target) => {
    player.sendMessage("    " + target.name);
  });
} 

function setLastTPPosition(player: Player){
  lastTPPosition[player.id] = {x: player.location.x, y:player.location.y, z:player.location.z, d: player.dimension.id}
}
var lastTPPosition: {[key: string]: DimensionedVector3} = {}