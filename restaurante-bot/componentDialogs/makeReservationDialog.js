const { WaterfallDialog, ComponentDialog } = require('botbuilder-dialogs');

const { ConfirmPrompt, ChoicePrompt, DateTimePrompt, NumberPrompt, TextPrompt } = require('botbuilder-dialogs');

const CHOICE_PROMPT = 'CHOICE_PROMPT';
const CONFIRM_PROMPT = 'CONFIRM_pROMPT';
const TEXT_PROMPT = 'TEXT_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';
const DATETIME_PROMPT = 'DATETIME_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

class MakeReservationDialog extends ComponentDialog {
    constructor() {
        super('makeReservationDialog');
        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new NumberPrompt(NUMBER_PROMPT, this.agePromptValidator));
        this.addDialog(new DateTimePrompt(DATETIME_PROMPT));
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [

        ]));
        this.firstStep.bind(this), // Pergunta se o usuário quer fazer uma reserva.
        this.getName.bind(this), // Pergunta o nome do usuário.
        this.getNumberOfParticipants.bind(this), // Quantidade de pessoas na mesa.
        this.getDate.bind(this), // Data da reserva.
        this.getTime.bind(this), // Horário da reserva.
        this.confirmStep.bind(this), // Mostra o resumo da reserva e pede uma confirmação.
        this.summaryStep.bind(this)
        this.initialDialogId = WATERFALL_DIALOG;
    }

    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);
        const dialogContext = await dialogSet.createContext(turnContext);

        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDealog(this.id);
        }
    }

    async firstStep(step) {
        return await step.prompt(CONFIRM_PROMPT, 'Você gostaria de fazer uma reserva?', ['Sim', 'Não']);
    };

    async getName(step) {
        if (step.result === true) {
            return await step.prompt(TEXT_PROMPT, 'A reserva vai ser feita no nome de quem?');
        }
    };
}
