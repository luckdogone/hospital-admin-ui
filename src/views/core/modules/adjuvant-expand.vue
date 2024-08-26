<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  PlusForm,
  type PlusColumn,
  type FieldValues
} from "plus-pro-components";
import * as adjuvantApi from "@/api/core/adjuvant";
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

const adjuvantColumns = computed(() => {
  return [
    {
      label: "辅助治疗",
      width: 120,
      prop: "adjuvantTherapy",
      valueType: "switch",
      colProps: { span: 12 }
    },
    {
      label: "参与临床研究",
      width: 120,
      prop: "clinicalResearch",
      valueType: "switch",
      colProps: { span: 12 }
    },
    {
      label: "研究详情",
      width: 120,
      prop: "researchDetails",
      valueType: "textarea",
      colProps: { span: 24 },
      fieldProps: {
        placeholder: "请输入研究详情"
      }
    },
    {
      label: "治疗方案",
      width: 120,
      prop: "therapyPlan",
      valueType: "textarea",
      colProps: { span: 24 },
      fieldProps: {
        placeholder: "请输入治疗方案"
      }
    },
    {
      label: "强化治疗",
      width: 120,
      prop: "intensifiedTherapy",
      valueType: "switch",
      colProps: { span: 12 }
    },
    {
      label: "强化方案",
      width: 120,
      prop: "intensifiedPlan",
      valueType: "textarea",
      colProps: { span: 24 },
      fieldProps: {
        placeholder: "请输入强化方案"
      }
    },
    {
      label: "剂量调整",
      width: 120,
      prop: "doseAdjustment",
      valueType: "switch",
      colProps: { span: 12 }
    },
    {
      label: "调整原因",
      width: 120,
      prop: "adjustmentReason",
      valueType: "textarea",
      colProps: { span: 24 },
      fieldProps: {
        placeholder: "请输入调整原因"
      }
    },
    {
      label: "终止治疗",
      width: 120,
      prop: "therapyTermination",
      valueType: "switch",
      colProps: { span: 12 }
    },
    {
      label: "终止原因",
      width: 120,
      prop: "terminationReason",
      valueType: "textarea",
      colProps: { span: 24 },
      fieldProps: {
        placeholder: "请输入终止原因"
      }
    }
  ] as PlusColumn[];
});

const rules = {
  // 添加必要的验证规则
};

const handleEdit = () => {
  if (hasAuth(props.permissions.adjuvant_update)) {
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
    const res = await adjuvantApi.adjuvantUpdate(String(id), updateData);
    if (res.success) {
      ElMessage.success("辅助治疗资料提交成功");
      localFormData.value = { ...values };
      emit("update:formData", localFormData.value);
    } else {
      throw new Error(res.message || "未知错误");
    }
  } catch (error) {
    console.error("辅助治疗资料提交失败", error);
    ElMessage.error(`辅助治疗资料提交失败：${error.message || "请重试"}`);
  } finally {
    emit("update:isEditing", false);
  }
};

const handleReset = () => {
  if (!props.isEditing) {
    ElMessage.warning("当前不处于编辑状态，无法重置");
    return;
  }
  console.log("重置辅助治疗资料表单，行ID:", props.rowId);
  localFormData.value = {
    adjuvantTherapy: false,
    clinicalResearch: false,
    researchDetails: "",
    therapyPlan: "",
    intensifiedTherapy: false,
    intensifiedPlan: "",
    doseAdjustment: false,
    adjustmentReason: "",
    therapyTermination: false,
    terminationReason: ""
  };
  emit("update:formData", { ...localFormData.value });
};
</script>

<template>
  <div>
    <div class="form-header">
      <h3>辅助治疗</h3>
      <el-button @click="handleEdit" type="primary" size="small">
        {{ isEditing ? "取消编辑" : "编辑" }}
      </el-button>
    </div>
    <PlusForm
      v-if="localFormData"
      :key="`adjuvant-${rowId}`"
      v-model="localFormData"
      class="w-[80%] max-w-[1000px] m-auto"
      :columns="adjuvantColumns"
      :rules="rules"
      label-position="right"
      @change="handleFormChange"
      :disabled="!isEditing"
      lazy
      @submit="handleSubmit"
      @reset="handleReset"
      submitText="提交辅助治疗"
      resetText="重置辅助治疗"
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
