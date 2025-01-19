import {
  world,
  system,
  WorldInitializeAfterEvent,
  ChatSendBeforeEvent
} from "@minecraft/server";
import { CommandData, Commands, getCommand, processCustomCommands, restartScript } from "./commands";
import { Vector3Utils } from "@minecraft/math";
import * as config from "./config";
import { WorldConfigs } from "./config";
import { MinecraftDimensionTypes } from "@minecraft/vanilla-data";

// Setup Hooks
system.run(mainLoop);
world.beforeEvents.chatSend.subscribe(onPlayerChatSend);
world.afterEvents.worldInitialize.subscribe(onWorldInitialize);

// On Initialize
function onWorldInitialize(eventData: WorldInitializeAfterEvent){
  restartScript()
}

// Main Loop
var ticks = 1;
function mainLoop() {

  try {
    processChat();
  } catch (e) {
  }
  system.run(mainLoop);
}




let commandDataStack: CommandData[] = []


function onPlayerChatSend(eventData: ChatSendBeforeEvent) {
  let player = eventData?.sender;
  let messageComponents = eventData?.message.split(" ");
  if(messageComponents && messageComponents.length > 0 && player){
    let cmd = getCommand(messageComponents[0]);
    if (cmd != Commands.INVALID){
      commandDataStack.push(
        {
          player: player,
          messageComponents: messageComponents,
          command: cmd
        })
      eventData.cancel = true;  
    }
  }
}

function processChat() {
  let failSafeIters = 100
  while (failSafeIters > 0 && commandDataStack.length > 0){
    let eventData =  commandDataStack.pop();
    failSafeIters--;
    if (eventData)
      processCustomCommands(eventData);
  }
}

