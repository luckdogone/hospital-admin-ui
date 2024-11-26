<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  PlusForm,
  type PlusColumn,
  type FieldValues
} from "plus-pro-components";
import * as caseApi from "@/api/core/case";
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

// 创建本地响应式数据
const localFormData = ref({ ...props.formData });

// 监听 prop 变化
watch(
  () => props.formData,
  newVal => {
    localFormData.value = { ...newVal };
  },
  { deep: true }
);

// 添加在 script 部分的其他 watch 函数附近
watch(
  () => localFormData.value.ultrasoundStatus,
  newVal => {
    if (!newVal || newVal === 0) {
      localFormData.value.ultrasoundSize = "";
      localFormData.value.ultrasoundBloodFlow = null;
      localFormData.value.ultrasoundBirads = "";
    }
  }
);

watch(
  () => localFormData.value.mammographyStatus,
  newVal => {
    if (!newVal || newVal === 0) {
      localFormData.value.mammographySize = "";
      localFormData.value.mammographyAggregation = null;
      localFormData.value.mammographyBirads = "";
    }
  }
);

watch(
  () => localFormData.value.mriStatus,
  newVal => {
    if (!newVal || newVal === 0) {
      localFormData.value.mriSize = "";
      localFormData.value.mriBloodFlow = null;
      localFormData.value.mriBirads = "";
    }
  }
);

watch(
  () => localFormData.value.breastCoreNeedle,
  newVal => {
    if (!newVal || newVal === 0) {
      localFormData.value.breastCoreNeedleResult = "";
    }
  }
);

watch(
  () => localFormData.value.axillaryCoreNeedle,
  newVal => {
    if (!newVal || newVal === 0) {
      localFormData.value.axillaryCoreNeedleResult = "";
    }
  }
);

watch(
  () => localFormData.value.axillaryFineNeedle,
  newVal => {
    if (!newVal || newVal === 0) {
      localFormData.value.axillaryFineNeedleResult = "";
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
      localFormData.value.erPct = null;
      localFormData.value.prPct = null;
      localFormData.value.her2 = null;
      localFormData.value.ki67Pct = null;
      localFormData.value.arPct = null;
      localFormData.value.fishTest = null;
    }
  }
);

watch(
  () => localFormData.value.ultrasoundStatus,
  newVal => {
    if (!newVal || newVal === 0) {
      localFormData.value.ultrasoundLeftSize = "";
      localFormData.value.ultrasoundLeftBloodFlow = null;
      localFormData.value.ultrasoundLeftBirads = "";
      localFormData.value.ultrasoundRightSize = "";
      localFormData.value.ultrasoundRightBloodFlow = null;
      localFormData.value.ultrasoundRightBirads = "";
    } else if (newVal === 1) {
      // Left
      localFormData.value.ultrasoundRightSize = "";
      localFormData.value.ultrasoundRightBloodFlow = null;
      localFormData.value.ultrasoundRightBirads = "";
    } else if (newVal === 2) {
      // Right
      localFormData.value.ultrasoundLeftSize = "";
      localFormData.value.ultrasoundLeftBloodFlow = null;
      localFormData.value.ultrasoundLeftBirads = "";
    }
  }
);

watch(
  () => localFormData.value.mammographyStatus,
  newVal => {
    if (!newVal || newVal === 0) {
      localFormData.value.mammographyLeftSize = "";
      localFormData.value.mammographyLeftAggregation = null;
      localFormData.value.mammographyLeftBirads = "";
      localFormData.value.mammographyRightSize = "";
      localFormData.value.mammographyRightAggregation = null;
      localFormData.value.mammographyRightBirads = "";
    } else if (newVal === 1) {
      // Left
      localFormData.value.mammographyRightSize = "";
      localFormData.value.mammographyRightAggregation = null;
      localFormData.value.mammographyRightBirads = "";
    } else if (newVal === 2) {
      // Right
      localFormData.value.mammographyLeftSize = "";
      localFormData.value.mammographyLeftAggregation = null;
      localFormData.value.mammographyLeftBirads = "";
    }
  }
);

watch(
  () => localFormData.value.mriStatus,
  newVal => {
    if (!newVal || newVal === 0) {
      localFormData.value.mriLeftSize = "";
      localFormData.value.mriLeftBloodFlow = null;
      localFormData.value.mriLeftBirads = "";
      localFormData.value.mriRightSize = "";
      localFormData.value.mriRightBloodFlow = null;
      localFormData.value.mriRightBirads = "";
    } else if (newVal === 1) {
      // Left
      localFormData.value.mriRightSize = "";
      localFormData.value.mriRightBloodFlow = null;
      localFormData.value.mriRightBirads = "";
    } else if (newVal === 2) {
      // Right
      localFormData.value.mriLeftSize = "";
      localFormData.value.mriLeftBloodFlow = null;
      localFormData.value.mriLeftBirads = "";
    }
  }
);

watch(
  () => localFormData.value.menstrualStatus,
  newVal => {
    if (!newVal || newVal === 1) {
      localFormData.value.menopausalAge = null;
    }
  }
);

// 病历资料表单列定义
const caseColumns = computed(() => {
  const ultrasoundStatus = localFormData.value?.ultrasoundStatus;
  const isUltrasoundLeftDisabled =
    !ultrasoundStatus || ultrasoundStatus === 0 || ultrasoundStatus === 2;
  const isUltrasoundRightDisabled =
    !ultrasoundStatus || ultrasoundStatus === 0 || ultrasoundStatus === 1;

  const mammographyStatus = localFormData.value?.mammographyStatus;
  const isMammographyLeftDisabled =
    !mammographyStatus || mammographyStatus === 0 || mammographyStatus === 2;
  const isMammographyRightDisabled =
    !mammographyStatus || mammographyStatus === 0 || mammographyStatus === 1;

  const mriStatus = localFormData.value?.mriStatus;
  const isMriLeftDisabled = !mriStatus || mriStatus === 0 || mriStatus === 2;
  const isMriRightDisabled = !mriStatus || mriStatus === 0 || mriStatus === 1;

  const menstrualStatus = localFormData.value?.menstrualStatus;
  const isMenstrualStatusDisabled = !menstrualStatus;

  // const isUltrasoundDisabled =
  //   !localFormData.value ||
  //   !localFormData.value.ultrasoundStatus ||
  //   localFormData.value.ultrasoundStatus === 0;
  // const isMammographyDisabled =
  //   !localFormData.value ||
  //   !localFormData.value.mammographyStatus ||
  //   localFormData.value.mammographyStatus === 0;
  // const isMriDisabled =
  //   !localFormData.value ||
  //   !localFormData.value.mriStatus ||
  //   localFormData.value.mriStatus === 0;
  const isBreastCoreNeedleDisabled =
    !localFormData.value ||
    !localFormData.value.breastCoreNeedle ||
    localFormData.value.breastCoreNeedle === 0;
  const isAxillaryCoreNeedleDisabled =
    !localFormData.value ||
    !localFormData.value.axillaryCoreNeedle ||
    localFormData.value.axillaryCoreNeedle === 0;
  const isAxillaryFineNeedleDisabled =
    !localFormData.value ||
    !localFormData.value.axillaryFineNeedle ||
    localFormData.value.axillaryFineNeedle === 0;
  const isCollarboneLymphNeedleDisabled =
    !localFormData.value ||
    !localFormData.value.collarboneLymphNeedle ||
    localFormData.value.collarboneLymphNeedleResult === 0;
  const isIhcDisabled =
    !localFormData.value ||
    !localFormData.value.ihcResult ||
    localFormData.value.ihcResult === 0;

  return [
    // 入院超声检查
    {
      label: "入院超声状态",
      width: 120,
      prop: "ultrasoundStatus",
      valueType: "select",
      colProps: { span: 24 },
      fieldProps: {
        placeholder: "请选择状态"
      },
      options: [
        { label: "未做", value: 0, color: "red" },
        { label: "左", value: 1, color: "blue" },
        { label: "右", value: 2, color: "yellow" },
        { label: "双侧", value: 3, color: "green" }
      ]
    },
    {
      label: "左超声大小/cm",
      width: 120,
      prop: "ultrasoundLeftSize",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入左侧大小",
        clearable: true,
        disabled: isUltrasoundLeftDisabled
      }
    },
    {
      label: "左血流信号",
      width: 120,
      prop: "ultrasoundLeftBloodFlow",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择",
        disabled: isUltrasoundLeftDisabled
      },
      options: [
        { label: "有", value: 1, color: "red" },
        { label: "无", value: 0, color: "blue" }
      ]
    },
    {
      label: "左BIRADS",
      width: 120,
      prop: "ultrasoundLeftBirads",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择",
        disabled: isUltrasoundLeftDisabled
      },
      options: [
        { label: "0类", value: "0", color: "red" },
        { label: "1类", value: "1", color: "blue" },
        { label: "2类", value: "2", color: "yellow" },
        { label: "3类", value: "3", color: "green" },
        { label: "4A类", value: "4A", color: "red" },
        { label: "4B类", value: "4B", color: "blue" },
        { label: "4C类", value: "4C", color: "yellow" },
        { label: "5类", value: "5", color: "green" },
        { label: "6类", value: "6", color: "red" }
      ]
    },
    // Right Ultrasound Fields
    {
      label: "右超声大小/cm",
      width: 120,
      prop: "ultrasoundRightSize",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入右侧大小",
        clearable: true,
        disabled: isUltrasoundRightDisabled
      }
    },
    {
      label: "右血流信号",
      width: 120,
      prop: "ultrasoundRightBloodFlow",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择",
        disabled: isUltrasoundRightDisabled
      },
      options: [
        { label: "有", value: 1, color: "red" },
        { label: "无", value: 0, color: "blue" }
      ]
    },
    {
      label: "右BIRADS",
      width: 120,
      prop: "ultrasoundRightBirads",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择",
        disabled: isUltrasoundRightDisabled
      },
      options: [
        { label: "0类", value: "0", color: "red" },
        { label: "1类", value: "1", color: "blue" },
        { label: "2类", value: "2", color: "yellow" },
        { label: "3类", value: "3", color: "green" },
        { label: "4A类", value: "4A", color: "red" },
        { label: "4B类", value: "4B", color: "blue" },
        { label: "4C类", value: "4C", color: "yellow" },
        { label: "5类", value: "5", color: "green" },
        { label: "6类", value: "6", color: "red" }
      ]
    },

    // 入院钼靶检查
    {
      label: "入院钼靶状态",
      width: 120,
      prop: "mammographyStatus",
      valueType: "select",
      colProps: { span: 24 },
      fieldProps: {
        placeholder: "请选择状态"
      },
      options: [
        { label: "未做", value: 0, color: "red" },
        { label: "左", value: 1, color: "blue" },
        { label: "右", value: 2, color: "yellow" },
        { label: "双侧", value: 3, color: "green" }
      ]
    },
    {
      label: "左钼靶大小/cm",
      width: 120,
      prop: "mammographyLeftSize",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入左侧大小",
        clearable: true,
        disabled: isMammographyLeftDisabled
      }
    },
    {
      label: "左细小钙化影",
      width: 120,
      prop: "mammographyLeftAggregation",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择",
        disabled: isMammographyLeftDisabled
      },
      options: [
        { label: "有", value: 1, color: "red" },
        { label: "无", value: 0, color: "blue" }
      ]
    },
    {
      label: "左BIRADS",
      width: 120,
      prop: "mammographyLeftBirads",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择",
        disabled: isMammographyLeftDisabled
      },
      options: [
        { label: "0类", value: "0", color: "red" },
        { label: "1类", value: "1", color: "blue" },
        { label: "2类", value: "2", color: "yellow" },
        { label: "3类", value: "3", color: "green" },
        { label: "4A类", value: "4A", color: "red" },
        { label: "4B类", value: "4B", color: "blue" },
        { label: "4C类", value: "4C", color: "yellow" },
        { label: "5类", value: "5", color: "green" },
        { label: "6类", value: "6", color: "red" }
      ]
    },
    {
      label: "右钼靶大小/cm",
      width: 120,
      prop: "mammographyRightSize",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入右侧大小",
        clearable: true,
        disabled: isMammographyRightDisabled
      }
    },
    {
      label: "右细小钙化影",
      width: 120,
      prop: "mammographyRightAggregation",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择",
        disabled: isMammographyRightDisabled
      },
      options: [
        { label: "有", value: 1, color: "red" },
        { label: "无", value: 0, color: "blue" }
      ]
    },
    {
      label: "右BIRADS",
      width: 120,
      prop: "mammographyRightBirads",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择",
        disabled: isMammographyRightDisabled
      },
      options: [
        { label: "0类", value: "0", color: "red" },
        { label: "1类", value: "1", color: "blue" },
        { label: "2类", value: "2", color: "yellow" },
        { label: "3类", value: "3", color: "green" },
        { label: "4A类", value: "4A", color: "red" },
        { label: "4B类", value: "4B", color: "blue" },
        { label: "4C类", value: "4C", color: "yellow" },
        { label: "5类", value: "5", color: "green" },
        { label: "6类", value: "6", color: "red" }
      ]
    },

    // 入院乳腺核磁检查
    {
      label: "入院乳腺核磁状态",
      width: 120,
      prop: "mriStatus",
      valueType: "select",
      colProps: { span: 24 },
      fieldProps: {
        placeholder: "请选择状态"
      },
      options: [
        { label: "未做", value: 0, color: "red" },
        { label: "左", value: 1, color: "blue" },
        { label: "右", value: 2, color: "yellow" },
        { label: "双侧", value: 3, color: "green" }
      ]
    },
    {
      label: "左乳腺大小/cm",
      width: 120,
      prop: "mriLeftSize",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入左侧大小",
        clearable: true,
        disabled: isMriLeftDisabled
      }
    },
    {
      label: "左增强信号",
      width: 120,
      prop: "mriLeftBloodFlow",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择",
        disabled: isMriLeftDisabled
      },
      options: [
        { label: "廓清型", value: 2, color: "red" },
        { label: "平台型", value: 1, color: "blue" },
        { label: "流入型", value: 0, color: "yellow" }
      ]
    },
    {
      label: "左BIRADS",
      width: 120,
      prop: "mriLeftBirads",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择",
        disabled: isMriLeftDisabled
      },
      options: [
        { label: "0类", value: "0", color: "red" },
        { label: "1类", value: "1", color: "blue" },
        { label: "2类", value: "2", color: "yellow" },
        { label: "3类", value: "3", color: "green" },
        { label: "4A类", value: "4A", color: "red" },
        { label: "4B类", value: "4B", color: "blue" },
        { label: "4C类", value: "4C", color: "yellow" },
        { label: "5类", value: "5", color: "green" },
        { label: "6类", value: "6", color: "red" }
      ]
    },

    {
      label: "右乳腺大小/cm",
      width: 120,
      prop: "mriRightSize",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入右侧大小",
        clearable: true,
        disabled: isMriRightDisabled
      }
    },
    {
      label: "右增强信号",
      width: 120,
      prop: "mriRightBloodFlow",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择",
        disabled: isMriRightDisabled
      },
      options: [
        { label: "廓清型", value: 2, color: "red" },
        { label: "平台型", value: 1, color: "blue" },
        { label: "流入型", value: 0, color: "yellow" }
      ]
    },
    {
      label: "右BIRADS",
      width: 120,
      prop: "mriRightBirads",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择",
        disabled: isMriRightDisabled
      },
      options: [
        { label: "0类", value: "0", color: "red" },
        { label: "1类", value: "1", color: "blue" },
        { label: "2类", value: "2", color: "yellow" },
        { label: "3类", value: "3", color: "green" },
        { label: "4A类", value: "4A", color: "red" },
        { label: "4B类", value: "4B", color: "blue" },
        { label: "4C类", value: "4C", color: "yellow" },
        { label: "5类", value: "5", color: "green" },
        { label: "6类", value: "6", color: "red" }
      ]
    },

    // 血常规检查
    {
      label: "白细胞计数 10⁹/L",
      width: 120,
      prop: "wbc",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入白细胞计数",
        clearable: true
      }
    },
    {
      label: "红细胞计数 10¹²/L",
      width: 120,
      prop: "rbc",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入红细胞计数",
        clearable: true
      }
    },
    {
      label: "血小板计数 10⁹/L",
      width: 240,
      prop: "platelets",
      valueType: "input",
      colProps: { span: 24 },
      fieldProps: {
        placeholder: "请输入血小板计数",
        clearable: true
      }
    },

    // 肝功能检查
    {
      label: "谷丙转氨酶 U/L",
      width: 120,
      prop: "alt",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入谷丙转氨酶",
        clearable: true
      }
    },
    {
      label: "谷草转氨酶 U/L",
      width: 120,
      prop: "ast",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入谷草转氨酶",
        clearable: true
      }
    },
    {
      label: "碱性磷酸酶 U/L",
      width: 120,
      prop: "alkalinePhosphatase",
      valueType: "input",
      colProps: { span: 24 },
      fieldProps: {
        placeholder: "请输入碱性磷酸酶",
        clearable: true
      }
    },

    // 肾功能检查
    {
      label: "血肌酐 umol/L",
      width: 120,
      prop: "creatinine",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入血肌酐",
        clearable: true
      }
    },
    {
      label: "血清尿素 mmol/L",
      width: 120,
      prop: "urea",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入血清尿素",
        clearable: true
      }
    },
    {
      label: "尿酸 umol/L",
      width: 120,
      prop: "uricAcid",
      valueType: "input",
      colProps: { span: 24 },
      fieldProps: {
        placeholder: "请输入尿酸值",
        clearable: true
      }
    },
    {
      label: "甘油三酯 mmol/L",
      width: 120,
      prop: "triglycerides",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入甘油三酯值",
        clearable: true
      }
    },
    {
      label: "低密度脂蛋白 mmol/L",
      width: 120,
      prop: "ldl",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入低密度脂蛋白值",
        clearable: true
      }
    },
    {
      label: "D-二聚体 ug/ml",
      width: 120,
      prop: "dimer",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入D-二聚体值",
        clearable: true
      }
    },
    {
      label: "癌胚抗原 ng/mL",
      width: 120,
      prop: "cea",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入CEA值",
        clearable: true
      }
    },
    {
      label: "癌抗原153 IU/mL",
      width: 120,
      prop: "ca153",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入CA153值",
        clearable: true
      }
    },
    {
      label: "癌抗原125 IU/mL",
      width: 120,
      prop: "ca125",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入CA125值",
        clearable: true
      }
    },
    {
      label: "月经状态",
      width: 120,
      prop: "menstrualStatus",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择月经状态"
      },
      options: [
        { label: "未绝经", value: 0, color: "green" },
        { label: "绝经", value: 1, color: "red" },
        { label: "子宫切除", value: 2, color: "green" }
      ]
    },
    {
      label: "绝经年龄",
      width: 120,
      prop: "menopausalAge",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入绝经年龄",
        clearable: true,
        disabled: isMenstrualStatusDisabled
      }
    },
    {
      label: "个人既往史",
      width: 120,
      prop: "personalMedicalHistory",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入个人既往史"
      }
    },
    {
      label: "家族史",
      width: 120,
      prop: "familyHistory",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入家族史"
      }
    },
    // 入院乳腺核心针检查
    {
      label: "有无乳腺粗针穿刺",
      width: 120,
      prop: "breastCoreNeedle",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择是否进行"
      },
      options: [
        { label: "无", value: 0, color: "red" },
        { label: "有", value: 1, color: "green" }
      ]
    },
    {
      label: "乳腺粗针穿刺病理结果",
      width: 120,
      prop: "breastCoreNeedleResult",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入乳腺粗针穿刺病理结果",
        disabled: isBreastCoreNeedleDisabled
      }
    },
    // 入院腋窝核心针检查
    {
      label: "有无腋窝粗针穿刺",
      width: 120,
      prop: "axillaryCoreNeedle",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择是否进行"
      },
      options: [
        { label: "无", value: 0, color: "red" },
        { label: "有", value: 1, color: "green" }
      ]
    },
    {
      label: "腋窝粗针穿刺病理结果",
      width: 120,
      prop: "axillaryCoreNeedleResult",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入腋窝粗针穿刺病理结果",
        disabled: isAxillaryCoreNeedleDisabled
      }
    },
    // 入院腋窝细针穿刺检查
    {
      label: "有无腋窝细针穿刺",
      width: 120,
      prop: "axillaryFineNeedle",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择是否进行"
      },
      options: [
        { label: "无", value: 0, color: "red" },
        { label: "有", value: 1, color: "green" }
      ]
    },
    {
      label: "腋窝细针穿刺病理结果",
      width: 120,
      prop: "axillaryFineNeedleResult",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入腋窝细针穿刺病理结果",
        disabled: isAxillaryFineNeedleDisabled
      }
    },
    // 入院锁骨上淋巴结穿刺检查
    {
      label: "有无锁骨上淋巴结穿刺",
      width: 120,
      prop: "collarboneLymphNeedle",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择是否进行"
      },
      options: [
        { label: "无", value: 0, color: "red" },
        { label: "有", value: 1, color: "green" }
      ]
    },
    {
      label: "锁骨上淋巴结穿刺病理结果",
      width: 120,
      prop: "collarboneLymphNeedleResult",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入锁骨上淋巴结穿刺病理结果",
        disabled: isCollarboneLymphNeedleDisabled
      }
    },

    // 入院IHC检查
    {
      label: "有无免疫组化结果",
      width: 120,
      prop: "ihcResult",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择有无免疫组化结果"
      },
      options: [
        { label: "有", value: 1, color: "green" },
        { label: "无", value: 0, color: "red" }
      ]
    },

    {
      label: "P120",
      width: 120,
      prop: "p120",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入P120",
        disabled: isIhcDisabled
      }
    },
    {
      label: "E-cad",
      width: 120,
      prop: "eCad",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入E-cad",
        disabled: isIhcDisabled
      }
    },
    {
      label: "CK5/6",
      width: 120,
      prop: "ck56",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入CK5/6",
        clearable: true,
        disabled: isIhcDisabled
      }
    },
    {
      label: "GATA3",
      width: 120,
      prop: "gata3",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择GATA3",
        disabled: isIhcDisabled
      },
      options: [
        { label: "阳性", value: 1, color: "green" },
        { label: "阴性", value: 0, color: "red" }
      ]
    },
    {
      label: "IHC ER%",
      width: 120,
      prop: "erPct",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入ER%",
        clearable: true,
        disabled: isIhcDisabled
      }
    },
    {
      label: "IHC PR%",
      width: 120,
      prop: "prPct",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入PR%",
        clearable: true,
        disabled: isIhcDisabled
      }
    },
    {
      label: "HER2",
      width: 120,
      prop: "her2",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择HER2状态",
        disabled: isIhcDisabled
      },
      options: [
        { label: "0", value: "0" },
        { label: "1+", value: "1+" },
        { label: "2+", value: "2+" },
        { label: "3+", value: "3+" }
      ]
    },
    {
      label: "Ki-67标志物%",
      width: 120,
      prop: "ki67Pct",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入Ki-67%",
        clearable: true,
        disabled: isIhcDisabled
      }
    },
    {
      label: "AR%",
      width: 120,
      prop: "arPct",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入AR百分比",
        clearable: true,
        disabled: isIhcDisabled
      }
    },
    {
      label: "FISH检测",
      width: 120,
      prop: "fishTest",
      valueType: "select",
      colProps: { span: 24 },
      fieldProps: {
        placeholder: "请选择FISH检测结果",
        disabled: isIhcDisabled
      },
      options: [
        { label: "阴性", value: "阴性" },
        { label: "阳性", value: "阳性" },
        { label: "缺失", value: "缺失" }
      ]
    },
    {
      label: "TNM分期",
      width: 120,
      prop: "tnm",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入TNM分期"
      }
    },
    {
      label: "病理分级",
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
      label: "亚型分型",
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

// 表单验证规则
const rules = {
  ultrasoundLeftSize: numberValidationRules,
  ultrasoundRightSize: numberValidationRules,
  mammographyLeftSize: numberValidationRules,
  mammographyRightSize: numberValidationRules,
  mriLeftSize: numberValidationRules,
  mriRightSize: numberValidationRules,
  // 血常规检查
  wbc: numberValidationRules,
  rbc: numberValidationRules,
  platelets: numberValidationRules,

  // 肝功能检查
  alt: numberValidationRules,
  ast: numberValidationRules,
  alkalinePhosphatase: numberValidationRules,

  // 肾功能检查
  creatinine: numberValidationRules,
  urea: numberValidationRules,
  uricAcid: numberValidationRules,

  // 其他检查指标
  triglycerides: numberValidationRules,
  ldl: numberValidationRules,
  dimer: numberValidationRules,
  cea: numberValidationRules,
  ca153: numberValidationRules,
  ca125: numberValidationRules,

  menopausalAge: numberValidationRules,

  // IHC检查相关
  erPct: numberValidationRules,
  prPct: numberValidationRules,
  ki67Pct: numberValidationRules,
  arPct: numberValidationRules
};

// 处理编辑按钮点击
const handleEdit = () => {
  if (hasAuth(props.permissions.case_update)) {
    emit("update:isEditing", !props.isEditing);
  } else {
    ElMessage.error("您没有编辑权限");
  }
};

// 权限检查函数
// const checkEditPermission = () => {
//   if (hasAuth(props.permissions.general_update)) {
//     emit("update:isEditing", !props.isEditing);
//   } else {
//     ElMessage.error("您没有编辑权限");
//   }
//   // return true; // 根据实际情况实现权限检查逻辑
// };

// 处理表单变化
const handleFormChange = (values: FieldValues, column: PlusColumn) => {
  console.log(values, column, "change");
  emit("update:formData", { ...localFormData.value });
};

// 处理表单提交
const handleSubmit = async (values: FieldValues): Promise<void> => {
  try {
    if (!props.isEditing) {
      ElMessage.warning("当前行不处于编辑状态,无法提交");
      return;
    }

    const { id, ...updateData } = values;
    const res = await caseApi.caseUpdate(String(id), updateData);
    if (res.success) {
      ElMessage.success("病历资料提交成功");
      localFormData.value = { ...values };
      emit("update:formData", localFormData.value);
      // emit("update:formData", { ...values });
      // emit("update:isEditing", false);
    } else {
      throw new Error(res.message || "未知错误");
    }
  } catch (error) {
    console.error("病历资料提交失败", error);
    ElMessage.error(`病历资料提交失败：${error.message || "请重试"}`);
  } finally {
    emit("update:isEditing", false);
  }
};

// 处理表单重置
const handleReset = () => {
  if (!props.isEditing) {
    ElMessage.warning("当前不处于编辑状态，无法重置");
    return;
  }
  console.log("重置病历资料表单，行ID:", props.rowId);
  localFormData.value = {
    ultrasoundStatus: null,
    ultrasoundLeftSize: "",
    ultrasoundLeftBloodFlow: null,
    ultrasoundLeftBirads: "",
    ultrasoundRightSize: "",
    ultrasoundRightBloodFlow: null,
    ultrasoundRightBirads: "",

    // 钼靶检查
    mammographyStatus: null,
    mammographyLeftSize: "",
    mammographyLeftAggregation: null,
    mammographyLeftBirads: "",
    mammographyRightSize: "",
    mammographyRightAggregation: null,
    mammographyRightBirads: "",

    // 核磁检查
    mriStatus: null,
    mriLeftSize: "",
    mriLeftBloodFlow: null,
    mriLeftBirads: "",
    mriRightSize: "",
    mriRightBloodFlow: null,
    mriRightBirads: "",

    // 血常规检查
    wbc: null,
    rbc: null,
    platelets: null,

    // 肝功能检查
    alt: null,
    ast: null,
    alkalinePhosphatase: null,

    // 肾功能检查
    creatinine: null,
    urea: null,
    uricAcid: null,
    triglycerides: null,
    ldl: null,

    // 其他检查指标
    dimer: null,
    cea: null,
    ca153: null,
    ca125: null,

    // 月经状态相关
    menstrualStatus: null,
    menopausalAge: null,

    // 病史
    personalMedicalHistory: "",
    familyHistory: "",

    // 穿刺检查
    breastCoreNeedle: null,
    breastCoreNeedleResult: "",
    axillaryCoreNeedle: null,
    axillaryCoreNeedleResult: "",
    axillaryFineNeedle: null,
    axillaryFineNeedleResult: "",
    collarboneLymphNeedle: null,
    collarboneLymphNeedleResult: "",

    // IHC检查
    ihcResult: null,
    p120: "",
    eCad: "",
    ck56: "",
    gata3: null,
    erPct: "",
    prPct: null,
    her2: "",
    ki67Pct: null,
    arPct: null,
    fishTest: "",

    // 分期和分型
    tnm: "",
    stage: "",
    subtype: ""
    // ... 其他字段的重置
  };
  emit("update:formData", { ...localFormData.value });
};
</script>

<template>
  <div>
    <div class="form-header">
      <h3>病历资料</h3>
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
      :key="`case-${rowId}`"
      v-model="localFormData"
      class="w-[80%] max-w-[1000px] m-auto"
      :columns="caseColumns"
      :rules="rules"
      label-position="right"
      @change="handleFormChange"
      :disabled="!isEditing"
      lazy
      @submit="handleSubmit"
      @reset="handleReset"
      submitText="提交病历资料"
      resetText="重置病历资料"
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
