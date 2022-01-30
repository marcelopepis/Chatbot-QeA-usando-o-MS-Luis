const { WaterfallDialog, ComponentDialog } = require('botbuilder-dialogs');

const { ConfirmPrompt, ChoicePrompt, DateTimePrompt, NumberPrompt, TextPrompt } = require('botbuilder-dialogs');

const { DialogSet, DialogTurnStatus } = require('botbuilder-dialogs');

const CHOICE_PROMPT = 'CHOICE_PROMPT';
const CONFIRM_PROMPT = 'CONFIRM_pROMPT';
const TEXT_PROMPT = 'TEXT_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';
const DATETIME_PROMPT = 'DATETIME_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
var endDialog = '';

class MakeReservationDialog extends ComponentDialog {
    constructor(conversationState, userState) {
        super('makeReservationDialog');
        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new NumberPrompt(NUMBER_PROMPT, this.noOfParticipantsValidator));
        this.addDialog(new DateTimePrompt(DATETIME_PROMPT));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.firstStep.bind(this), // confirma se o usuário deseja fazer uma reserva.
            this.getName.bind(this), // recebe o nome do usuário.
            this.getNumberOfParticipants.bind(this), // Numero de participantes na reserva.
            this.getDate.bind(this), // Dia da reserva.
            this.getTime.bind(this), // Horário da reserva.
            this.summaryStep.bind(this), // resumo dos dados da reserva.
            this.confirmStep.bind(this)

        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    async firstStep(step) {
        endDialog = false;
        return await step.prompt(CONFIRM_PROMPT, 'Você gostaria de fazer uma reserva?', ['Sim', 'Não']);
    };

    async getName(step) {
        if (step.result === true) {
            return await step.prompt(TEXT_PROMPT, 'A reserva vai ser feita no nome de quem?');
        } else if (step.result === false) {
            await step.context.sendActivity('Nenhuma reserva foi feita.');
            endDialog = true;
            return await step.endDialog();
        }
    };

    async getNumberOfParticipants(step) {
        step.values.name = step.result;
        return await step.prompt(NUMBER_PROMPT, 'Mesa para quantas pessoas (1-20)?');
    };

    async getDate(step) {
        step.values.nOfParticipants = step.result;
        return await step.prompt(DATETIME_PROMPT, 'Informe a data da reserva');
    }

    async getTime(step) {
        step.values.date = step.result;
        return await step.prompt(DATETIME_PROMPT, 'Qual o horario da reserva?');
    }

    async summaryStep(step) {
        step.values.time = step.result;
        var msg = `Então ficamos com a seguinte reserva: \n Name: ${ step.values.name } \n 
                   Participantes: ${ JSON.stringify(step.values.nOfParticipants) } \n 
                   Data: ${ JSON.stringify(step.values.date) } \n
                   Horário: ${ JSON.stringify(step.values.time) }`;
        await step.context.sendActivity(msg);
        return await step.prompt(CONFIRM_PROMPT, 'Você gostaria de confirmar essa reserva?', ['Sim', 'Não']);
    };

    async confirmStep(step) {
        if (step.result === true) {
            // salvar a reserva no banco
            await step.context.sendActivity('Reserva feita com sucesso! Id da sua reserva: ID123432');
            endDialog = true;
            return await step.endDialog();
        }
    }

    async noOfParticipantsValidator(promptContext) {
        return promptContext.recognized.succeeded && promptContext.recognized.value >= 1 && promptContext.recognized.value <= 20;
    }

    async isDialogComplete() {
        return endDialog;
    }
}
module.exports.MakeReservationDialog = MakeReservationDialog;
