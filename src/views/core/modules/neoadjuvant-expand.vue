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

const neoadjuvantColumns = computed(() => {
  return [
    {
      label: "新辅助治疗",
      width: 120,
      prop: "neoadjTherapy",
      valueType: "switch",
      colProps: { span: 12 }
    },
    {
      label: "参与临床研究",
      width: 120,
      prop: "clinResearch",
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
      label: "免疫治疗",
      width: 120,
      prop: "immunotherapy",
      valueType: "switch",
      colProps: { span: 12 }
    },
    {
      label: "1周期肿物大小",
      width: 120,
      prop: "week1Size",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入1周期肿物大小"
      }
    },
    {
      label: "2周期肿物大小",
      width: 120,
      prop: "week2Size",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入2周期肿物大小"
      }
    },
    {
      label: "3周期肿物大小",
      width: 120,
      prop: "week3Size",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入3周期肿物大小"
      }
    },
    {
      label: "4周期肿物大小",
      width: 120,
      prop: "week4Size",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入4周期肿物大小"
      }
    },
    {
      label: "5周期肿物大小",
      width: 120,
      prop: "week5Size",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入5周期肿物大小"
      }
    },
    {
      label: "6周期肿物大小",
      width: 120,
      prop: "week6Size",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入6周期肿物大小"
      }
    },
    {
      label: "2/3周期肿物大小",
      width: 120,
      prop: "week23Size",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入2/3周期肿物大小"
      }
    },
    {
      label: "4/5周期肿物大小",
      width: 120,
      prop: "week45Size",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入4/5周期肿物大小"
      }
    },
    {
      label: "6/7周期肿物大小",
      width: 120,
      prop: "week67Size",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入6/7周期肿物大小"
      }
    },
    {
      label: "8周期肿物大小",
      width: 120,
      prop: "week8Size",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入8周期肿物大小"
      }
    },
    {
      label: "剂量调整",
      width: 120,
      prop: "doseAdjust",
      valueType: "switch",
      colProps: { span: 12 }
    },
    {
      label: "调整原因",
      width: 120,
      prop: "adjustReason",
      valueType: "textarea",
      colProps: { span: 24 },
      fieldProps: {
        placeholder: "请输入调整原因"
      }
    },
    {
      label: "终止治疗",
      width: 120,
      prop: "therapyTerm",
      valueType: "switch",
      colProps: { span: 12 }
    },
    {
      label: "终止原因",
      width: 120,
      prop: "termReason",
      valueType: "textarea",
      colProps: { span: 24 },
      fieldProps: {
        placeholder: "请输入终止原因"
      }
    },
    {
      label: "G-CSF",
      width: 120,
      prop: "gcsf",
      valueType: "switch",
      colProps: { span: 12 }
    },
    {
      label: "长效G-CSF",
      width: 120,
      prop: "longGcsf",
      valueType: "switch",
      colProps: { span: 12 }
    },
    {
      label: "录入状态",
      width: 120,
      prop: "inputStatus",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        options: [
          { label: "未录入", value: 0 },
          { label: "录入中", value: 1 },
          { label: "已录入", value: 2 }
        ]
      }
    },
    {
      label: "启用状态",
      width: 120,
      prop: "isEnable",
      valueType: "switch",
      colProps: { span: 12 }
    },
    {
      label: "删除状态",
      width: 120,
      prop: "isDel",
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

    const { id: _, ...updateData } = values;
    const res = await neoadjuvantApi.neoadjuvantUpdate(
      String(props.rowId),
      updateData
    );
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
