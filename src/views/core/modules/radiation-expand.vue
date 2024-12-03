<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  PlusForm,
  type PlusColumn,
  type FieldValues
} from "plus-pro-components";
import * as radiationApi from "@/api/core/radiation";
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

watch(
  () => localFormData.value.clinicalResearch,
  newVal => {
    if (!newVal || newVal === 0) {
      localFormData.value.clinicalResearchDetails = null;
    }
  }
);

watch(
  () => localFormData.value.radiationRange,
  newVal => {
    if (!newVal || newVal === 0) {
      localFormData.value.chestWall = null;
      localFormData.value.supraclavicular = null;
      localFormData.value.armpit = null;
      localFormData.value.breast = null;
    }
  }
);

const radiationColumns = computed(() => {
  const isClinicalResearchDisabled =
    !localFormData.value ||
    !localFormData.value.clinicalResearch ||
    localFormData.value.clinicalResearch === 0;
  const isRadiationRangeDisabled =
    !localFormData.value ||
    !localFormData.value.radiationRange ||
    localFormData.value.radiationRange === 0;
  return [
    {
      label: "是否进行放射治疗",
      width: 120,
      prop: "radiationTreatment",
      valueType: "switch",
      colProps: { span: 12 }
    },
    {
      label: "是否加入临床研究",
      width: 120,
      prop: "clinicalResearch",
      valueType: "switch",
      colProps: { span: 24 }
    },
    {
      label: "具体临床研究",
      width: 120,
      prop: "clinicalResearchDetails",
      valueType: "textarea",
      colProps: { span: 24 },
      fieldProps: {
        placeholder: "请输入临床研究详情",
        disabled: isClinicalResearchDisabled
      }
    },
    {
      label: "具体放疗方案",
      width: 120,
      prop: "treatmentPlan",
      valueType: "textarea",
      colProps: { span: 24 },
      fieldProps: {
        placeholder: "请输入具体放疗方案"
      }
    },
    {
      label: "放疗部位",
      width: 120,
      prop: "treatmentLocation",
      valueType: "textarea",
      colProps: { span: 24 },
      fieldProps: {
        placeholder: "请输入放疗部位"
      }
    },
    {
      label: "放射范围",
      width: 120,
      prop: "radiationRange",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择"
      },
      options: [
        { label: "有", value: 1, color: "red" },
        { label: "无", value: 0, color: "blue" }
      ]
    },
    {
      label: "胸壁",
      width: 120,
      prop: "chestWall",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择",
        disabled: isRadiationRangeDisabled
      },
      options: [
        { label: "有", value: 1, color: "red" },
        { label: "无", value: 0, color: "blue" }
      ]
    },
    {
      label: "锁骨上",
      width: 120,
      prop: "supraclavicular",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择",
        disabled: isRadiationRangeDisabled
      },
      options: [
        { label: "有", value: 1, color: "red" },
        { label: "无", value: 0, color: "blue" }
      ]
    },
    {
      label: "腋窝",
      width: 120,
      prop: "armpit",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择",
        disabled: isRadiationRangeDisabled
      },
      options: [
        { label: "有", value: 1, color: "red" },
        { label: "无", value: 0, color: "blue" }
      ]
    },
    {
      label: "乳房",
      width: 120,
      prop: "breast",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择",
        disabled: isRadiationRangeDisabled
      },
      options: [
        { label: "有", value: 1, color: "red" },
        { label: "无", value: 0, color: "blue" }
      ]
    },
    {
      label: "合并药物",
      width: 120,
      prop: "mergeDrugs",
      valueType: "textarea",
      colProps: { span: 24 },
      fieldProps: {
        placeholder: "请输入合并药物"
      }
    },
    {
      label: "放疗次数",
      width: 120,
      prop: "radiationNumber",
      valueType: "digit",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入放疗次数"
      }
    },
    {
      label: "分割剂量",
      width: 120,
      prop: "splitDose",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入分割剂量"
      }
    },
    {
      label: "总剂量",
      width: 120,
      prop: "totalDose",
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入总剂量"
      }
    },
    {
      label: "急性放射性皮肤反应",
      width: 120,
      prop: "radiationInducedReaction",
      valueType: "textarea",
      colProps: { span: 24 },
      fieldProps: {
        placeholder: "请输入急性放射性皮肤反应"
      }
    }
  ] as PlusColumn[];
});

const rules = {
  // 添加必要的验证规则
};

const handleEdit = () => {
  if (hasAuth(props.permissions.radiation_update)) {
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
    const res = await radiationApi.radiationUpdate(String(id), updateData);
    if (res.success) {
      ElMessage.success("放射治疗资料提交成功");
      localFormData.value = { ...values };
      emit("update:formData", localFormData.value);
    } else {
      throw new Error(res.message || "未知错误");
    }
  } catch (error) {
    console.error("放射治疗资料提交失败", error);
    ElMessage.error(`放射治疗资料提交失败：${error.message || "请重试"}`);
  } finally {
    emit("update:isEditing", false);
  }
};

const handleReset = () => {
  if (!props.isEditing) {
    ElMessage.warning("当前不处于编辑状态，无法重置");
    return;
  }
  console.log("重置放射治疗资料表单，行ID:", props.rowId);
  localFormData.value = {
    radiationTreatment: false,
    clinicalResearch: false,
    clinicalResearchDetails: "",
    treatmentPlan: "",
    treatmentLocation: ""
  };
  emit("update:formData", { ...localFormData.value });
};
</script>

<template>
  <div>
    <div class="form-header">
      <h3>放射治疗</h3>
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
      :key="`radiation-${rowId}`"
      v-model="localFormData"
      class="w-[80%] max-w-[1000px] m-auto"
      :columns="radiationColumns"
      :rules="rules"
      label-position="right"
      @change="handleFormChange"
      :disabled="!isEditing"
      lazy
      @submit="handleSubmit"
      @reset="handleReset"
      submitText="提交放射治疗"
      resetText="重置放射治疗"
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
