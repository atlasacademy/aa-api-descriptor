import {DataVal, Func} from "@atlasacademy/api-connector";
import {FuncType} from "@atlasacademy/api-connector/dist/Schema/Func";
import {default as describeBuffValue} from "../Buff/describeValue";
import {BasePartial, Descriptor, ParticlePartial, TextPartial, ValuePartial, ValueType} from "../Descriptor";
import describeGainHpFromTargetsValue from "./Value/describeGainHpFromTargetsValue";
import describeGainNpFromTargets from "./Value/describeGainNpFromTargets";
import describeNpAbsorbValue from "./Value/describeNpAbsorbValue";

export default function (func: Func.Func,
                         staticDataVal: DataVal.DataVal,
                         dataVal: DataVal.DataVal,
                         ignoreRate?: boolean): Descriptor | undefined {
    const partials: BasePartial[] = [],
        addPartials = (additional: BasePartial[]) => {
            if (partials.length && additional.length)
                partials.push(new ParticlePartial(' + '));

            partials.push(...additional);
        };

    if (!ignoreRate && dataVal.Rate !== undefined) {
        partials.push(
            new ValuePartial(ValueType.PERCENT, dataVal.Rate / 10),
            new TextPartial(' Chance')
        );
    }

    if (func.funcType === FuncType.ADD_STATE || func.funcType === FuncType.ADD_STATE_SHORT) {
        const valueDescriptor = describeBuffValue(func.buffs[0], dataVal),
            valuePartials = valueDescriptor?.partials() ?? [];

        addPartials(valuePartials);
    } else if (func.funcType === FuncType.ABSORB_NPTURN) {
        addPartials(describeNpAbsorbValue(staticDataVal, dataVal));
    } else if (func.funcType === FuncType.GAIN_HP_FROM_TARGETS) {
        addPartials(describeGainHpFromTargetsValue(staticDataVal, dataVal));
    } else if (func.funcType === FuncType.GAIN_NP_FROM_TARGETS) {
        addPartials(describeGainNpFromTargets(staticDataVal, dataVal));
    } else {
        if (dataVal.Value !== undefined) {
            switch (func.funcType) {
                case Func.FuncType.DAMAGE_NP:
                case Func.FuncType.DAMAGE_NP_HPRATIO_LOW:
                case Func.FuncType.DAMAGE_NP_INDIVIDUAL:
                case Func.FuncType.DAMAGE_NP_INDIVIDUAL_SUM:
                case Func.FuncType.DAMAGE_NP_PIERCE:
                case Func.FuncType.DAMAGE_NP_RARE:
                case Func.FuncType.DAMAGE_NP_STATE_INDIVIDUAL_FIX:
                case Func.FuncType.GAIN_HP_PER:
                case Func.FuncType.QP_DROP_UP:
                    addPartials([
                        new ValuePartial(ValueType.PERCENT, dataVal.Value / 10)
                    ]);
                    break;
                case Func.FuncType.GAIN_NP:
                case Func.FuncType.GAIN_NP_BUFF_INDIVIDUAL_SUM:
                case Func.FuncType.LOSS_NP:
                    addPartials([
                        new ValuePartial(ValueType.PERCENT, dataVal.Value / 100)
                    ]);
                    break;
                default:
                    addPartials([
                        new ValuePartial(ValueType.NUMBER, dataVal.Value)
                    ]);
            }
        }

        if (dataVal.Value2 !== undefined) {
            switch (func.funcType) {
                case Func.FuncType.DAMAGE_NP_INDIVIDUAL_SUM:
                    addPartials([
                        new TextPartial('additional '),
                        new ValuePartial(ValueType.PERCENT, dataVal.Value2 / 10)
                    ]);
            }
        }

        if (dataVal.Correction !== undefined) {
            switch (func.funcType) {
                case Func.FuncType.DAMAGE_NP_INDIVIDUAL:
                case Func.FuncType.DAMAGE_NP_RARE:
                case Func.FuncType.DAMAGE_NP_STATE_INDIVIDUAL_FIX:
                    addPartials([
                        new ValuePartial(ValueType.PERCENT, dataVal.Correction / 10)
                    ]);
                    break;
                case Func.FuncType.DAMAGE_NP_INDIVIDUAL_SUM:
                    addPartials([
                        new ParticlePartial('('),
                        new ValuePartial(ValueType.PERCENT, dataVal.Correction / 10),
                        new TextPartial(' x count'),
                        new ParticlePartial(')'),
                    ]);
                    break;
                default:
                    addPartials([
                        new ValuePartial(ValueType.NUMBER, dataVal.Correction)
                    ]);
            }
        }

        if (dataVal.Target !== undefined) {
            switch (func.funcType) {
                case Func.FuncType.DAMAGE_NP_HPRATIO_LOW:
                    addPartials([
                        new ValuePartial(ValueType.PERCENT, dataVal.Target / 10)
                    ]);
                    break;
                default:
                    addPartials([
                        new ValuePartial(ValueType.UNKNOWN, dataVal.Target)
                    ]);
            }
        }

        if (dataVal.AddCount !== undefined) {
            addPartials([
                new ValuePartial(ValueType.NUMBER, dataVal.AddCount)
            ]);
        }

        if (dataVal.UseRate !== undefined) {
            addPartials([
                new ValuePartial(ValueType.PERCENT, dataVal.UseRate / 10),
                new TextPartial(' Chance to Trigger')
            ]);
        }

        if (dataVal.RateCount !== undefined) {
            switch (func.funcType) {
                case Func.FuncType.QP_DROP_UP:
                case Func.FuncType.SERVANT_FRIENDSHIP_UP:
                case Func.FuncType.USER_EQUIP_EXP_UP:
                    addPartials([
                        new ValuePartial(ValueType.PERCENT, dataVal.RateCount / 10)
                    ]);
                    break;
                default:
                    addPartials([
                        new ValuePartial(ValueType.UNKNOWN, dataVal.RateCount)
                    ]);
            }
        }

        if (dataVal.Count !== undefined) {
            addPartials([
                new ValuePartial(ValueType.NUMBER, dataVal.Count),
                new TextPartial(' Time' + (dataVal.Count > 1 ? 's' : ''))
            ]);
        }
    }

    return partials.length ? new Descriptor(partials) : undefined;
}

