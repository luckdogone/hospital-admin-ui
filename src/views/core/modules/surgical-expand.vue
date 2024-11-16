<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  PlusForm,
  type PlusColumn,
  type FieldValues
} from "plus-pro-components";
import * as surgicalApi from "@/api/core/surgical";
import { ElMessage } from "element-plus";
import { hasAuth } from "@/router/utils";

const props = defineProps({
  rowId: {
    type: Number,
    required: true
  },
  formData: {
    type: Object,
    required: true
  },
  isEditing: {
    type: Boolean,
    required: true
  },
  permissions: {
    type: Object,
    required: true
  },
  hideEditButton: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["update:formData", "update:isEditing"]);

const localFormData = ref({ ...props.formData });

watch(
  () => props.formData,
  newVal => {
    localFormData.value = { ...newVal };
  },
  { deep: true }
);

// Define surgicalColumns based on the provided fields
watch(
  () => localFormData.value.hasSlnBiopsy,
  newVal => {
    if (!newVal || newVal === 0) {
      localFormData.value.useNs = null;
      localFormData.value.preTad = null;
      localFormData.value.slnCount = null;
      localFormData.value.slnMeta = null;
      localFormData.value.slnMetaCount = null;
      localFormData.value.slnMicroMetaCount = null;
      localFormData.value.slnItcCount = null;
    }
  }
);
watch(
  () => localFormData.value.ald,
  newVal => {
    if (!newVal || newVal === 0) {
      localFormData.value.aldStage = null;
      localFormData.value.aldCount = null;
      localFormData.value.aldMetaCount = null;
      localFormData.value.aldMicroMetaCount = null;
      localFormData.value.aldItcCount = null;
      localFormData.value.apexMeta = null;
      localFormData.value.imMeta = null;
    }
  }
);
watch(
  () => localFormData.value.ihcResult,
  newVal => {
    if (!newVal || newVal === 0) {
      localFormData.value.p120 = null;
      localFormData.value.eCad = null;
      localFormData.value.ck56 = null;
      localFormData.value.gata3 = null;
      localFormData.value.p63 = null;
      localFormData.value.p53 = null;
      localFormData.value.trps1 = null;
      localFormData.value.sam = null;
      localFormData.value.egfr = null;
      localFormData.value.erPct = "";
      localFormData.value.prPct = "";
      localFormData.value.her2 = null;
      localFormData.value.ki67Pct = null;
      localFormData.value.arPct = null;
      localFormData.value.fishTest = null;
    }
  }
);
const surgicalColumns = computed(() => {
  const isHasSlnBiopsyDisabled =
    !localFormData.value ||
    !localFormData.value.hasSlnBiopsy ||
    localFormData.value.hasSlnBiopsy === 0;
  const isAldDisabled =
    !localFormData.value ||
    !localFormData.value.ald ||
    localFormData.value.ald === 0;
  const isIhcResultDisabled =
    !localFormData.value ||
    !localFormData.value.ihcResult ||
    localFormData.value.ihcResult === 0;
  return [
    {
      label: "手术时间",
      width: 120,
      prop: "surgeryTime",
      valueType: "date-picker",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择手术时间",
        type: "date",
        valueFormat: "YYYY-MM-DD"
      }
    },
    {
      label: "手术部位",
      width: 120,
      prop: "surgicalSite",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择"
      },
      options: [
        { label: "左", value: "左" },
        { label: "右", value: "右" },
        { label: "双侧", value: "双侧" }
      ]
    },
    {
      label: "是否全乳切除",
      width: 120,
      prop: "isTotalPartial",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择"
      },
      options: [
        { label: "否", value: 0 },
        { label: "是", value: 1 }
      ]
    },
    {
      label: "是否保乳",
      width: 120,
      prop: "isBreastConserve",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择"
      },
      options: [
        { label: "否", value: 0 },
        { label: "是", value: 1 }
      ]
    },
    {
      label: "是否保留乳头",
      width: 120,
      prop: "isNippleSpare",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择"
      },
      options: [
        { label: "否", value: 0 },
        { label: "是", value: 1 }
      ]
    },
    {
      label: "是否内窥镜手术",
      width: 120,
      prop: "isEndoscopic",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择"
      },
      options: [
        { label: "否", value: 0 },
        { label: "是", value: 1 }
      ]
    },
    {
      label: "是否重建",
      width: 120,
      prop: "isReconstruction",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择"
      },
      options: [
        { label: "否", value: 0 },
        { label: "是", value: 1 }
      ]
    },
    {
      label: "重建方法",
      width: 120,
      prop: "reconMethod",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择重建方法"
      },
      options: [
        { label: "自体", value: "自体" },
        { label: "假体", value: "假体" }
      ]
    },
    {
      label: "肿瘤大小(cm)",
      width: 120,
      prop: "tumorSizeCm",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入肿瘤大小",
        clearable: true
      }
    },
    {
      label: "有无脉管癌栓",
      width: 120,
      prop: "hasLymphInvasion",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择"
      },
      options: [
        { label: "有", value: 1 },
        { label: "无", value: 0 }
      ]
    },
    {
      label: "有无神经侵犯",
      width: 120,
      prop: "hasNerveInvasion",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择"
      },
      options: [
        { label: "有", value: 1 },
        { label: "无", value: 0 }
      ]
    },
    {
      label: "是否多发",
      width: 120,
      prop: "isMultifocal",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择"
      },
      options: [
        { label: "否", value: 0 },
        { label: "是", value: 1 }
      ]
    },
    {
      label: "肿瘤位置",
      width: 120,
      prop: "tumorLocation",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择"
      },
      options: [
        { label: "中央区", value: "中央区" },
        { label: "外上象限", value: "外上象限" },
        { label: "内上象限", value: "内上象限" },
        { label: "外下象限", value: "外下象限" },
        { label: "内下象限", value: "内下象限" }
      ]
    },
    {
      label: "是否前哨淋巴结活检",
      width: 120,
      prop: "hasSlnBiopsy",
      valueType: "select",
      colProps: { span: 24 },
      fieldProps: {
        placeholder: "请选择"
      },
      options: [
        { label: "否", value: 0 },
        { label: "是", value: 1 }
      ]
    },
    {
      label: "是否使用核素",
      width: 120,
      prop: "useNs",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择",
        disabled: isHasSlnBiopsyDisabled
      },
      options: [
        { label: "否", value: 0 },
        { label: "是", value: 1 }
      ]
    },
    {
      label: "是否新辅助前TAD",
      width: 120,
      prop: "preTad",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择",
        disabled: isHasSlnBiopsyDisabled
      },
      options: [
        { label: "否", value: 0 },
        { label: "是", value: 1 }
      ]
    },
    {
      label: "前哨淋巴结数量/个",
      width: 120,
      prop: "slnCount",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入数量",
        clearable: true,
        disabled: isHasSlnBiopsyDisabled
      }
    },
    {
      label: "是否前哨淋巴结转移",
      width: 120,
      prop: "slnMeta",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择",
        disabled: isHasSlnBiopsyDisabled
      },
      options: [
        { label: "否", value: 0 },
        { label: "是", value: 1 }
      ]
    },
    {
      label: "前哨淋巴结转移数量/个",
      width: 120,
      prop: "slnMetaCount",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入数量",
        clearable: true,
        disabled: isHasSlnBiopsyDisabled
      }
    },
    {
      label: "前哨淋巴结微转移数量/个",
      width: 120,
      prop: "slnMicroMetaCount",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入数量",
        clearable: true,
        disabled: isHasSlnBiopsyDisabled
      }
    },
    {
      label: "前哨孤立肿瘤细胞数量/个",
      width: 120,
      prop: "slnItcCount",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入数量",
        clearable: true,
        disabled: isHasSlnBiopsyDisabled
      }
    },
    {
      label: "是否腋窝淋巴结清扫",
      width: 120,
      prop: "ald",
      valueType: "select",
      colProps: { span: 24 },
      fieldProps: {
        placeholder: "请选择"
      },
      options: [
        { label: "否", value: 0 },
        { label: "是", value: 1 }
      ]
    },
    {
      label: "腋窝淋巴结清扫分级",
      width: 120,
      prop: "aldStage",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择",
        disabled: isAldDisabled
      },
      options: [
        { label: "I", value: "I" },
        { label: "II", value: "II" },
        { label: "III", value: "III" }
      ]
    },
    {
      label: "腋窝清扫淋巴结数量/个",
      width: 120,
      prop: "aldCount",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入数量",
        clearable: true,
        disabled: isAldDisabled
      }
    },
    {
      label: "腋窝淋巴结转移数量/个",
      width: 120,
      prop: "aldMetaCount",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入数量",
        clearable: true,
        disabled: isAldDisabled
      }
    },
    {
      label: "腋窝微转移数量/个",
      width: 120,
      prop: "aldMicroMetaCount",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入数量",
        clearable: true,
        disabled: isAldDisabled
      }
    },
    {
      label: "腋窝孤立肿瘤细胞数量/个",
      width: 120,
      prop: "aldItcCount",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入数量",
        clearable: true,
        disabled: isAldDisabled
      }
    },
    {
      label: "是否有腋尖淋巴结转移",
      width: 120,
      prop: "apexMeta",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择",
        disabled: isAldDisabled
      },
      options: [
        { label: "否", value: 0 },
        { label: "是", value: 1 }
      ]
    },
    {
      label: "是否有肌间淋巴结转移",
      width: 120,
      prop: "imMeta",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择",
        disabled: isAldDisabled
      },
      options: [
        { label: "否", value: 0 },
        { label: "是", value: 1 }
      ]
    },
    {
      label: "术后有无免疫组化结果",
      width: 120,
      prop: "ihcResult",
      valueType: "select",
      colProps: { span: 24 },
      fieldProps: {
        placeholder: "请选择"
      },
      options: [
        { label: "有", value: 1 },
        { label: "无", value: 0 }
      ]
    },
    {
      label: "P120",
      width: 120,
      prop: "p120",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入P120",
        disabled: isIhcResultDisabled
      }
    },
    {
      label: "E-cad",
      width: 120,
      prop: "eCad",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入E-cad",
        disabled: isIhcResultDisabled
      }
    },
    {
      label: "CK5/6",
      width: 120,
      prop: "ck56",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择CK5/6",
        disabled: isIhcResultDisabled
      },
      options: [
        { label: "阳性", value: 1, color: "green" },
        { label: "阴性", value: 0, color: "red" }
      ]
    },
    {
      label: "GATA3",
      width: 120,
      prop: "gata3",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择GATA3",
        disabled: isIhcResultDisabled
      },
      options: [
        { label: "阳性", value: 1, color: "green" },
        { label: "阴性", value: 0, color: "red" }
      ]
    },
    {
      label: "P63",
      width: 120,
      prop: "p63",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入P63",
        disabled: isIhcResultDisabled
      }
    },
    {
      label: "P53",
      width: 120,
      prop: "p53",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入P53",
        disabled: isIhcResultDisabled
      }
    },
    {
      label: "TRPS1",
      width: 120,
      prop: "trps1",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入TRPS1",
        disabled: isIhcResultDisabled
      }
    },
    {
      label: "SAM",
      width: 120,
      prop: "sam",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入SAM",
        disabled: isIhcResultDisabled
      }
    },
    {
      label: "EGFR",
      width: 120,
      prop: "egfr",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入EGFR",
        disabled: isIhcResultDisabled
      }
    },
    {
      label: "术后ER%",
      width: 120,
      prop: "erPct",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入术后ER%",
        clearable: true,
        disabled: isIhcResultDisabled
      }
    },
    {
      label: "术后PR%",
      width: 120,
      prop: "prPct",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入术后PR%",
        clearable: true,
        disabled: isIhcResultDisabled
      }
    },
    {
      label: "术后HER2",
      width: 120,
      prop: "her2",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择",
        disabled: isIhcResultDisabled
      },
      options: [
        { label: "0", value: "0" },
        { label: "1+", value: "1+" },
        { label: "2+", value: "2+" },
        { label: "3+", value: "3+" }
      ]
    },
    {
      label: "术后ki-67%",
      width: 120,
      prop: "ki67Pct",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入术后ki-67%",
        clearable: true,
        disabled: isIhcResultDisabled
      }
    },
    {
      label: "术后AR%",
      width: 120,
      prop: "arPct",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入术后AR%",
        clearable: true,
        disabled: isIhcResultDisabled
      }
    },
    // {
    //   label: "Miller-Payne系统分级",
    //   width: 120,
    //   prop: "postopPathGrade",
    //   valueType: "select",
    //   colProps: { span: 12 },
    //   fieldProps: {
    //     placeholder: "请选择"
    //   },
    //   options: [
    //     { label: "1", value: "1" },
    //     { label: "2", value: "2" },
    //     { label: "3", value: "3" },
    //     { label: "4", value: "4" },
    //     { label: "5", value: "5" }
    //   ]
    // },
    {
      label: "术后Fish检测",
      width: 120,
      prop: "fishTest",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择",
        disabled: isIhcResultDisabled
      },
      options: [
        { label: "阴性", value: "阴性" },
        { label: "阳性", value: "阳性" }
      ]
    },
    {
      label: "术后TNM分期",
      width: 120,
      prop: "tnm",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入TNM分期"
      }
    },
    {
      label: "术后病理分级",
      width: 120,
      prop: "stage",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择"
      },
      options: [
        { label: "无", value: "无" },
        { label: "I", value: "I" },
        { label: "II", value: "II" },
        { label: "III", value: "III" }
      ]
    },
    {
      label: "术后分型",
      width: 120,
      prop: "subtype",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择分型"
      },
      options: [
        { label: "三阴性", value: "三阴性" },
        { label: "Luminal A", value: "Luminal A" },
        { label: "Luminal B HER2阴性型", value: "Luminal B HER2阴性型" },
        { label: "Luminal B HER2阳性型", value: "Luminal B HER2阳性型" },
        { label: "HER2阳性型", value: "HER2阳性型" }
      ]
    },
    {
      label: "特殊类型肿瘤",
      width: 120,
      prop: "specialTypeTumors",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择特殊类型肿瘤"
      },
      options: [
        { label: "原位癌", value: "原位癌" },
        { label: "Paget’s病", value: "Paget’s病" },
        { label: "小叶癌", value: "小叶癌" },
        { label: "粘液癌", value: "粘液癌" },
        { label: "筛状癌", value: "筛状癌" },
        { label: "化生性癌", value: "化生性癌" },
        { label: "乳头状癌", value: "乳头状癌" },
        { label: "髓样癌", value: "髓样癌" },
        { label: "神经内分泌肿瘤", value: "神经内分泌肿瘤" }
      ]
    },
    {
      label: "术后MP级别",
      width: 120,
      prop: "mpLevel",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择MP级别"
      },
      options: [
        { label: "1", value: 1 },
        { label: "2", value: 2 },
        { label: "3", value: 3 },
        { label: "4", value: 4 },
        { label: "5", value: 5 }
      ]
    },
    {
      label: "RCB评分",
      width: 120,
      prop: "rcb",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择RCB评分"
      },
      options: [
        { label: "0", value: "0" },
        { label: "1", value: "1" },
        { label: "2", value: "2" },
        { label: "3", value: "3" }
      ]
    }
  ] as PlusColumn[];
});

// 表单验证规则
const numberValidationRules = [
  {
    validator: (rule, value, callback) => {
      // 如果值为空，允许通过（除非该字段是必填的）
      if (!value) {
        callback();
        return;
      }

      // 检查是否包含非数字字符（除了小数点）
      if (!/^[\d.]+$/.test(value)) {
        callback(new Error("请输入数字"));
        return;
      }

      // 检查小数点的数量
      if ((value.match(/\./g) || []).length > 1) {
        callback(new Error("只能包含一个小数点"));
        return;
      }

      // 检查是否是有效数字
      const num = parseFloat(value);
      if (isNaN(num)) {
        callback(new Error("请输入有效的数字"));
        return;
      }

      // 检查是否为负数
      if (num < 0) {
        callback(new Error("请输入大于0的数字"));
        return;
      }

      // 检查小数位数
      const decimalParts = value.split(".");
      if (decimalParts.length > 1 && decimalParts[1].length > 2) {
        callback(new Error("小数点后最多两位"));
        return;
      }

      callback();
    },
    trigger: ["blur", "change"]
  }
];

const rules = {
  surgicalTime: [{ required: true, message: "请选择手术时间" }],
  tumorSizeCm: numberValidationRules,
  slnCount: numberValidationRules,
  slnMetaCount: numberValidationRules,
  slnMicroMetaCount: numberValidationRules,
  slnItcCount: numberValidationRules,
  aldCount: numberValidationRules,
  aldMetaCount: numberValidationRules,
  aldMicroMetaCount: numberValidationRules,
  aldItcCount: numberValidationRules,
  erPct: numberValidationRules,
  prPct: numberValidationRules,
  ki67Pct: numberValidationRules,
  arPct: numberValidationRules
  // Add more validation rules as needed
};

const handleEdit = () => {
  if (hasAuth(props.permissions.surgical_update)) {
    emit("update:isEditing", !props.isEditing);
  } else {
    ElMessage.error("您没有编辑权限");
  }
};

const handleFormChange = (values: FieldValues, column: PlusColumn) => {
  console.log(values, column, "change");
  emit("update:formData", { ...localFormData.value });
};

const handleSubmit = async (values: FieldValues): Promise<void> => {
  try {
    if (!props.isEditing) {
      ElMessage.warning("当前行不处于编辑状态,无法提交");
      return;
    }

    const { id, ...updateData } = values;
    const res = await surgicalApi.surgicalUpdate(String(id), updateData);
    if (res.success) {
      ElMessage.success("手术相关资料提交成功");
      localFormData.value = { ...values };
      emit("update:formData", localFormData.value);
    } else {
      throw new Error(res.message || "未知错误");
    }
  } catch (error) {
    console.error("手术相关资料提交失败", error);
    ElMessage.error(`手术相关资料提交失败：${error.message || "请重试"}`);
  } finally {
    emit("update:isEditing", false);
  }
};

const handleReset = () => {
  if (!props.isEditing) {
    ElMessage.warning("当前不处于编辑状态，无法重置");
    return;
  }
  console.log("重置手术相关资料表单，行ID:", props.rowId);
  localFormData.value = {
    surgicalTime: "",
    isTotalPartial: null
    // Reset other fields
  };
  emit("update:formData", { ...localFormData.value });
};
</script>

<template>
  <div>
    <div class="form-header">
      <h3>手术相关</h3>
      <el-button
        @click="handleEdit"
        type="primary"
        size="small"
        v-if="!hideEditButton"
      >
        {{ isEditing ? "取消编辑" : "编辑" }}
      </el-button>
    </div>
    <PlusForm
      v-if="localFormData"
      :key="`surgical-${rowId}`"
      v-model="localFormData"
      class="w-[80%] max-w-[1000px] m-auto"
      :columns="surgicalColumns"
      :rules="rules"
      label-position="right"
      @change="handleFormChange"
      :disabled="!isEditing"
      lazy
      @submit="handleSubmit"
      @reset="handleReset"
      submitText="提交手术相关"
      resetText="重置手术相关"
      style="display: flex; flex-direction: column; align-items: center"
    />
  </div>
</template>

<style scoped>
.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
</style>
