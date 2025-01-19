import { world, system } from "@minecraft/server";
import { Commands, getCommand, processCustomCommands, restartScript } from "./commands";
// Setup Hooks
system.run(mainLoop);
world.beforeEvents.chatSend.subscribe(onPlayerChatSend);
world.afterEvents.worldInitialize.subscribe(onWorldInitialize);
// On Initialize
function onWorldInitialize(eventData) {
    restartScript();
}
// Main Loop
var ticks = 1;
function mainLoop() {
    try {
        processChat();
    }
    catch (e) {
    }
    system.run(mainLoop);
}
let commandDataStack = [];
function onPlayerChatSend(eventData) {
    let player = eventData === null || eventData === void 0 ? void 0 : eventData.sender;
    let messageComponents = eventData === null || eventData === void 0 ? void 0 : eventData.message.split(" ");
    if (messageComponents && messageComponents.length > 0 && player) {
        let cmd = getCommand(messageComponents[0]);
        if (cmd != Commands.INVALID) {
            commandDataStack.push({
                player: player,
                messageComponents: messageComponents,
                command: cmd
            });
            eventData.cancel = true;
        }
    }
}
function processChat() {
    let failSafeIters = 100;
    while (failSafeIters > 0 && commandDataStack.length > 0) {
        let eventData = commandDataStack.pop();
        failSafeIters--;
        if (eventData)
            processCustomCommands(eventData);
    }
}
//# sourceMappingURL=main.js.map