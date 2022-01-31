const { WaterfallDialog, ComponentDialog } = require('botbuilder-dialogs');

const { ConfirmPrompt, ChoicePrompt, DateTimePrompt, NumberPrompt, TextPrompt } = require('botbuilder-dialogs');

const { DialogSet, DialogTurnStatus } = require('botbuilder-dialogs');

const { CardFactory } = require('botbuilder');

const CHOICE_PROMPT = 'CHOICE_PROMPT';
const CONFIRM_PROMPT = 'CONFIRM_pROMPT';
const TEXT_PROMPT = 'TEXT_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';
const DATETIME_PROMPT = 'DATETIME_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const RestaurantCard = require('../resources/adaptativeCards/RestaurantCard.json');
const CARDS = [RestaurantCard];
var endDialog = '';

class CancelReservationDialog extends ComponentDialog {
    constructor(conversationState, userState) {
        super('cancelReservationDialog');
        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new NumberPrompt(NUMBER_PROMPT));
        this.addDialog(new DateTimePrompt(DATETIME_PROMPT));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.firstStep.bind(this), // Pede ao usuário o número da reserva que ele deseja cancelar.
            this.summaryStep.bind(this), // Informa ao usuário o número da reserva que ele forneceu.
            this.confirmStep.bind(this) // Confirma o cancelamento.

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
        await step.context.sendActivity({
            text: 'Informe a id da reserva para cancelamento.',
            attachments: [CardFactory.adaptiveCard(CARDS[0])]
        });
        return await step.prompt(TEXT_PROMPT, '');
    };

    async summaryStep(step) {
        step.values.reservationId = step.result;
        var msg = `Este é o número da sua reserva: \n ${ step.values.reservationId }`;
        await step.context.sendActivity(msg);
        return await step.prompt(CONFIRM_PROMPT, 'Tem certeza que deseja cancelar essa reserva?', ['Sim', 'Não']);
    };

    async confirmStep(step) {
        if (step.result === true) {
            // salvar a reserva no banco
            await step.context.sendActivity('Ok, sua reserva foi cancelada com sucesso.');
            endDialog = true;
            return await step.endDialog();
        }
    }

    async isDialogComplete() {
        return endDialog;
    }
}
module.exports.CancelReservationDialog = CancelReservationDialog;
