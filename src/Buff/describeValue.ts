import {Buff, DataVal} from "@atlasacademy/api-connector";
import CardReferencePartial from "../Card/CardReferencePartial";
import {BasePartial, Descriptor, ParticlePartial, TextPartial, ValuePartial, ValueType} from "../Descriptor";
import SkillReferencePartial from "../Skill/SkillReferencePartial";
import TraitReferencePartial from "../Trait/TraitReferencePartial";
import {
    BuffValueCommandCardType,
    buffValueCommandCardTypes,
    buffValuePercentTypes,
    BuffValueTraitType,
    buffValueTraitTypes,
    BuffValueTriggerType,
    buffValueTriggerTypes
} from "./BuffValueTypes";

export default function (buff: Buff.Buff, dataVal?: DataVal.DataVal): Descriptor | undefined {
    const buffValuePercentType = buffValuePercentTypes.get(buff.type);
    if (buffValuePercentType) {
        return describeDataVal(
            dataVal ?? {},
            buffValuePercentType.value,
            ValueType.PERCENT,
            Math.pow(10, buffValuePercentType.power),
        );
    }

    const buffValueTriggerType = buffValueTriggerTypes.get(buff.type);
    if (buffValueTriggerType) {
        return describeTriggerValue(
            dataVal ?? {},
            buffValueTriggerType
        );
    }

    const buffValueTraitType = buffValueTraitTypes.get(buff.type);
    if (buffValueTraitType) {
        return describeTraitValue(
            dataVal ?? {},
            buffValueTraitType
        );
    }

    const buffValueCommandCardType = buffValueCommandCardTypes.get(buff.type);
    if (buffValueCommandCardType) {
        return describeCommandcardValue(
            dataVal ?? {},
            buffValueCommandCardType
        );
    }

    return describeDataVal(
        dataVal ?? {},
        DataVal.DataValField.VALUE,
        ValueType.NUMBER,
        1
    );
}

function describeCommandcardValue(dataVal: DataVal.DataVal, commandCardType: BuffValueCommandCardType): Descriptor | undefined {
    const partials: BasePartial[] = [],
        card = dataVal[commandCardType.card];

    if (typeof card === "number") {
        partials.push(new CardReferencePartial(card));
    }

    return partials.length > 0 ? new Descriptor(partials) : undefined;
}

function describeDataVal(dataVal: DataVal.DataVal, valueField: DataVal.DataValField, valueType: ValueType, base: number): Descriptor | undefined {
    const partials: BasePartial[] = [];

    const value = dataVal[valueField];
    if (typeof value === "number") {
        partials.push(new ValuePartial(valueType, value / base));
    }

    const lowScalingValue = dataVal.RatioHPLow;
    if (lowScalingValue !== undefined) {
        if (partials.length)
            partials.push(new ParticlePartial(' + '));

        partials.push(new ParticlePartial('('));
        partials.push(new ValuePartial(valueType, lowScalingValue / base));
        partials.push(new ParticlePartial(' Scales by Low HP)'));
    }

    return partials.length > 0 ? new Descriptor(partials) : undefined;
}

function describeTraitValue(dataVal: DataVal.DataVal, traitType: BuffValueTraitType): Descriptor | undefined {
    const partials: BasePartial[] = [],
        trait = dataVal[traitType.trait];

    if (typeof trait === "number") {
        partials.push(new TraitReferencePartial(trait));
    }

    return partials.length > 0 ? new Descriptor(partials) : undefined;
}

function describeTriggerValue(dataVal: DataVal.DataVal, triggerType: BuffValueTriggerType): Descriptor | undefined {
    const partials: BasePartial[] = [],
        skill = dataVal[triggerType.skill],
        level = dataVal[triggerType.level],
        position = triggerType.position ? dataVal[triggerType.position] : undefined,
        rate = triggerType.rate ? dataVal[triggerType.rate] : undefined;

    if (typeof skill === "number") {
        if (partials.length)
            partials.push(new ParticlePartial(' + '));

        partials.push(new SkillReferencePartial(skill));
    }

    if (typeof level === "number") {
        if (partials.length)
            partials.push(new ParticlePartial(' + '));

        partials.push(new TextPartial('Lv. '));
        partials.push(new ValuePartial(ValueType.UNKNOWN, level));
    }

    if (typeof rate === "number") {
        if (partials.length)
            partials.push(new ParticlePartial(' + '));

        partials.push(new TextPartial('Chance: '));
        partials.push(new ValuePartial(ValueType.PERCENT, rate / 10));
    }

    return partials.length > 0 ? new Descriptor(partials) : undefined;
}
