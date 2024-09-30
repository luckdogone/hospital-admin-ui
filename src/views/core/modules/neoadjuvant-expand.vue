<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  PlusForm,
  type PlusColumn,
  type FieldValues
} from "plus-pro-components";
import * as neoadjuvantApi from "@/api/core/neoadjuvant";
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

const localFormData = ref({ ...props.formData });

watch(
  () => props.formData,
  newVal => {
    localFormData.value = { ...newVal };
  },
  { deep: true }
);

watch(
  () => localFormData.value.clinResearch,
  newVal => {
    if (!newVal || newVal === 0) {
      localFormData.value.researchDetails = null;
    }
  }
);

watch(
  () => localFormData.value.doseAdjust,
  newVal => {
    if (!newVal || newVal === 0) {
      localFormData.value.adjustReason = null;
    }
  }
);

watch(
  () => localFormData.value.therapyTerm,
  newVal => {
    if (!newVal || newVal === 0) {
      localFormData.value.termReason = null;
    }
  }
);

const neoadjuvantColumns = computed(() => {
  const isClinResearchDisabled =
    !localFormData.value ||
    !localFormData.value.clinResearch ||
    localFormData.value.clinResearch === 0;
  const isDoseAdjustDisabled =
    !localFormData.value ||
    !localFormData.value.doseAdjust ||
    localFormData.value.doseAdjust === 0;
  const isTherapyTermDisabled =
    !localFormData.value ||
    !localFormData.value.therapyTerm ||
    localFormData.value.therapyTerm === 0;
  return [
    {
      label: "是否进行新辅助治疗",
      width: 120,
      prop: "neoadjTherapy",
      valueType: "switch",
      colProps: { span: 24 }
    },
    {
      label: "是否加入临床研究",
      width: 120,
      prop: "clinResearch",
      valueType: "switch",
      colProps: { span: 12 }
    },
    {
      label: "具体临床研究",
      width: 120,
      prop: "researchDetails",
      valueType: "textarea",
      colProps: { span: 24 },
      fieldProps: {
        placeholder: "请输入具体临床研究",
        disabled: isClinResearchDisabled
      }
    },
    {
      label: "具体新辅助治疗方案",
      width: 120,
      prop: "therapyPlan",
      valueType: "textarea",
      colProps: { span: 24 },
      fieldProps: {
        placeholder: "请输入具体新辅助治疗方案"
      }
    },
    {
      label: "是否有免疫药物应用",
      width: 120,
      prop: "immunotherapy",
      valueType: "switch",
      colProps: { span: 24 }
    },
    {
      label: "1周期超声示肿物大小",
      width: 120,
      prop: "week1Size",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入1周期超声示肿物大小"
      }
    },
    {
      label: "2周期超声示肿物大小",
      width: 120,
      prop: "week2Size",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入2周期超声示肿物大小"
      }
    },
    {
      label: "3周期超声示肿物大小",
      width: 120,
      prop: "week3Size",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入3周期超声示肿物大小"
      }
    },
    {
      label: "4周期超声示肿物大小",
      width: 120,
      prop: "week4Size",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入4周期超声示肿物大小"
      }
    },
    {
      label: "5周期超声示肿物大小",
      width: 120,
      prop: "week5Size",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入5周期超声示肿物大小"
      }
    },
    {
      label: "6周期超声示肿物大小",
      width: 120,
      prop: "week6Size",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入6周期超声示肿物大小"
      }
    },
    {
      label: "7周期超声示肿物大小",
      width: 120,
      prop: "week7Size",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入7周期超声示肿物大小"
      }
    },
    {
      label: "8周期超声示肿物大小",
      width: 120,
      prop: "week8Size",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入8周期超声示肿物大小"
      }
    },
    {
      label: "2/3周期核磁示肿物大小",
      width: 120,
      prop: "week23Size",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入2/3周期核磁示肿物大小"
      }
    },
    {
      label: "4/5周期核磁示肿物大小",
      width: 120,
      prop: "week45Size",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入4/5周期核磁示肿物大小"
      }
    },
    {
      label: "6/7周期核磁示肿物大小",
      width: 120,
      prop: "week67Size",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入6/7周期核磁示肿物大小"
      }
    },
    {
      label: "是否有新辅助药物剂量调整",
      width: 120,
      prop: "doseAdjust",
      valueType: "switch",
      colProps: { span: 12 }
    },
    {
      label: "新辅助药物剂量调整原因",
      width: 120,
      prop: "adjustReason",
      valueType: "textarea",
      colProps: { span: 24 },
      fieldProps: {
        placeholder: "请输入新辅助药物剂量调整原因",
        disabled: isDoseAdjustDisabled
      }
    },
    {
      label: "是否终止新辅助治疗",
      width: 120,
      prop: "therapyTerm",
      valueType: "switch",
      colProps: { span: 12 }
    },
    {
      label: "终止新辅助治疗原因",
      width: 120,
      prop: "termReason",
      valueType: "textarea",
      colProps: { span: 24 },
      fieldProps: {
        placeholder: "请输入终止原因",
        disabled: isTherapyTermDisabled
      }
    },
    {
      label: "是否有升白针应用",
      width: 120,
      prop: "gcsf",
      valueType: "switch",
      colProps: { span: 12 }
    },
    {
      label: "是否有长效升白针应用",
      width: 120,
      prop: "longGcsf",
      valueType: "switch",
      colProps: { span: 12 }
    }
  ] as PlusColumn[];
});

const rules = {
  // 添加必要的验证规则
};

const handleEdit = () => {
  if (hasAuth(props.permissions.neoadjuvant_update)) {
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
    const res = await neoadjuvantApi.neoadjuvantUpdate(String(id), updateData);
    if (res.success) {
      ElMessage.success("新辅助治疗资料提交成功");
      localFormData.value = { ...values };
      emit("update:formData", localFormData.value);
    } else {
      throw new Error(res.message || "未知错误");
    }
  } catch (error) {
    console.error("新辅助治疗资料提交失败", error);
    ElMessage.error(`新辅助治疗资料提交失败：${error.message || "请重试"}`);
  } finally {
    emit("update:isEditing", false);
  }
};

const handleReset = () => {
  if (!props.isEditing) {
    ElMessage.warning("当前不处于编辑状态，无法重置");
    return;
  }
  console.log("重置新辅助治疗资料表单，行ID:", props.rowId);
  localFormData.value = {
    neoadjTherapy: false,
    clinResearch: false,
    researchDetails: "",
    therapyPlan: "",
    immunotherapy: false
    // ... 重置其他字段
  };
  emit("update:formData", { ...localFormData.value });
};
</script>

<template>
  <div>
    <div class="form-header">
      <h3>新辅助治疗</h3>
      <el-button @click="handleEdit" type="primary" size="small">
        {{ isEditing ? "取消编辑" : "编辑" }}
      </el-button>
    </div>
    <PlusForm
      v-if="localFormData"
      :key="`neoadjuvant-${rowId}`"
      v-model="localFormData"
      class="w-[80%] max-w-[1000px] m-auto"
      :columns="neoadjuvantColumns"
      :rules="rules"
      label-position="right"
      @change="handleFormChange"
      :disabled="!isEditing"
      lazy
      @submit="handleSubmit"
      @reset="handleReset"
      submitText="提交新辅助治疗"
      resetText="重置新辅助治疗"
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
