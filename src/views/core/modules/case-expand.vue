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
      localFormData.value.erPct = null;
      localFormData.value.prPct = null;
      localFormData.value.her2 = null;
      localFormData.value.ki67Pct = null;
      localFormData.value.arPct = null;
      localFormData.value.fishTest = null;
    }
  }
);

// 病历资料表单列定义
const caseColumns = computed(() => {
  const isUltrasoundDisabled =
    !localFormData.value ||
    !localFormData.value.ultrasoundStatus ||
    localFormData.value.ultrasoundStatus === 0;
  const isMammographyDisabled =
    !localFormData.value ||
    !localFormData.value.mammographyStatus ||
    localFormData.value.mammographyStatus === 0;
  const isMriDisabled =
    !localFormData.value ||
    !localFormData.value.mriStatus ||
    localFormData.value.mriStatus === 0;
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
      colProps: { span: 12 },
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
      label: "超声大小/cm",
      width: 120,
      prop: "ultrasoundSize",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入大小",
        disabled: isUltrasoundDisabled
      }
    },
    {
      label: "血流信号",
      width: 120,
      prop: "ultrasoundBloodFlow",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择",
        disabled: isUltrasoundDisabled
      },
      options: [
        { label: "有", value: 1, color: "red" },
        { label: "无", value: 0, color: "blue" }
      ]
    },
    {
      label: "BIRADS",
      width: 120,
      prop: "ultrasoundBirads",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入类别",
        disabled: isUltrasoundDisabled
      }
    },

    // 入院钼靶检查
    {
      label: "入院钼靶状态",
      width: 120,
      prop: "mammographyStatus",
      valueType: "select",
      colProps: { span: 12 },
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
      label: "钼靶大小/cm",
      width: 120,
      prop: "mammographySize",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入大小",
        disabled: isMammographyDisabled
      }
    },
    {
      label: "细小钙化影",
      width: 120,
      prop: "mammographyAggregation",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择",
        disabled: isMammographyDisabled
      },
      options: [
        { label: "有", value: 1, color: "red" },
        { label: "无", value: 0, color: "blue" }
      ]
    },
    {
      label: "BIRADS",
      width: 120,
      prop: "mammographyBirads",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入类别",
        disabled: isMammographyDisabled
      }
    },

    // 入院乳腺核磁检查
    {
      label: "入院乳腺核磁状态",
      width: 120,
      prop: "mriStatus",
      valueType: "select",
      colProps: { span: 12 },
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
      label: "乳腺大小/cm",
      width: 120,
      prop: "mriSize",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入大小",
        disabled: isMriDisabled
      }
    },
    {
      label: "增强信号",
      width: 120,
      prop: "mriBloodFlow",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择",
        disabled: isMriDisabled
      },
      options: [
        { label: "有", value: 1, color: "red" },
        { label: "无", value: 0, color: "blue" }
      ]
    },
    {
      label: "BIRADS",
      width: 120,
      prop: "mriBirads",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入类别",
        disabled: isMriDisabled
      }
    },

    // 血常规检查
    {
      label: "白细胞计数",
      width: 120,
      prop: "wbc",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入白细胞计数"
      }
    },
    {
      label: "红细胞计数",
      width: 120,
      prop: "rbc",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入红细胞计数"
      }
    },
    {
      label: "血小板计数",
      width: 240,
      prop: "platelets",
      valueType: "copy",
      colProps: { span: 24 },
      fieldProps: {
        placeholder: "请输入血小板计数"
      }
    },

    // 肝功能检查
    {
      label: "谷丙转氨酶",
      width: 120,
      prop: "alt",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入谷丙转氨酶"
      }
    },
    {
      label: "谷草转氨酶",
      width: 120,
      prop: "ast",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入谷草转氨酶"
      }
    },
    {
      label: "碱性磷酸酶",
      width: 120,
      prop: "alkalinePhosphatase",
      valueType: "copy",
      colProps: { span: 24 },
      fieldProps: {
        placeholder: "请输入碱性磷酸酶"
      }
    },

    // 肾功能检查
    {
      label: "血肌酐",
      width: 120,
      prop: "creatinine",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入血肌酐"
      }
    },
    {
      label: "血清尿素",
      width: 120,
      prop: "urea",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入血清尿素"
      }
    },
    {
      label: "尿酸",
      width: 120,
      prop: "uricAcid",
      valueType: "copy",
      colProps: { span: 24 },
      fieldProps: {
        placeholder: "请输入尿酸"
      }
    },
    {
      label: "甘油三酯",
      width: 120,
      prop: "triglycerides",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入甘油三酯"
      }
    },
    {
      label: "低密度脂蛋白",
      width: 120,
      prop: "ldl",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入低密度脂蛋白"
      }
    },
    {
      label: "D-二聚体",
      width: 120,
      prop: "dimer",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入D-二聚体"
      }
    },
    {
      label: "癌胚抗原（CEA）",
      width: 120,
      prop: "cea",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入CEA"
      }
    },
    {
      label: "癌抗原153（CA153）",
      width: 120,
      prop: "ca153",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入CA153"
      }
    },
    {
      label: "癌抗原125（CA125）",
      width: 120,
      prop: "ca125",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入CA125"
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
        { label: "无", value: 0, color: "red" },
        { label: "有", value: 1, color: "green" }
      ]
    },
    {
      label: "IHC ER%",
      width: 120,
      prop: "erPct",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入ER%",
        disabled: isIhcDisabled
      }
    },
    {
      label: "IHC PR%",
      width: 120,
      prop: "prPct",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入PR%",
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
      label: "Ki-67标志物百分比",
      width: 120,
      prop: "ki67Pct",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入Ki-67百分比",
        disabled: isIhcDisabled
      }
    },
    {
      label: "AR%",
      width: 120,
      prop: "arPct",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入AR百分比",
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
        { label: "阳性", value: "阳性" }
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
      label: "分期",
      width: 120,
      prop: "stage",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择分期"
      },
      options: [
        { label: "无", value: "无" },
        { label: "I", value: "I" },
        { label: "II", value: "II" },
        { label: "III", value: "III" }
      ]
    },
    {
      label: "分型",
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
        { label: "Luminal B HER2阳性型", value: "Luminal B HER2阳性型" }
      ]
    }
  ] as PlusColumn[];
});

// 表单验证规则
const rules = {
  name: [{ required: true, message: "请输入名称" }],
  surgicalNum: [{ required: true, message: "请输入手术编号", trigger: "blur" }]
};

// 处理编辑按钮点击
const handleEdit = () => {
  if (hasAuth(props.permissions.general_update)) {
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
    ultrasoundStatus: "",
    ultrasoundSize: "",
    ultrasoundBloodFlow: null,
    ultrasoundBirads: ""
    // ... 其他字段的重置
  };
  emit("update:formData", { ...localFormData.value });
};
</script>

<template>
  <div>
    <div class="form-header">
      <h3>病历资料</h3>
      <el-button @click="handleEdit" type="primary" size="small">
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
