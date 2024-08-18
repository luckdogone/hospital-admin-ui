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
const surgicalColumns = computed(() => {
  return [
    {
      label: "手术时间",
      width: 120,
      prop: "surgeryTime",
      valueType: "date-picker",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择手术时间",
        type: "datetime"
      }
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
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入重建方法"
      }
    },
    {
      label: "肿瘤大小(cm)",
      width: 120,
      prop: "tumorSizeCm",
      valueType: "input-number",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入肿瘤大小",
        step: 0.1,
        precision: 1
      }
    },
    {
      label: "是否有淋巴管侵犯",
      width: 120,
      prop: "hasLymphInvasion",
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
      label: "是否有神经侵犯",
      width: 120,
      prop: "hasNerveInvasion",
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
      label: "术后病理分级",
      width: 120,
      prop: "postopPathGrade",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择"
      },
      options: [
        { label: "I", value: "I" },
        { label: "II", value: "II" },
        { label: "III", value: "III" }
      ]
    },
    {
      label: "是否多灶",
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
      valueType: "input",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入肿瘤位置"
      }
    },
    {
      label: "是否前哨淋巴结活检",
      width: 120,
      prop: "hasSlnBiopsy",
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
      label: "是否使用核素",
      width: 120,
      prop: "useNs",
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
      label: "是否术前定位",
      width: 120,
      prop: "preTad",
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
      label: "前哨淋巴结数量",
      width: 120,
      prop: "slnCount",
      valueType: "input-number",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入数量",
        step: 1,
        precision: 0
      }
    },
    {
      label: "前哨淋巴结转移",
      width: 120,
      prop: "slnMeta",
      valueType: "input-number",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入数量",
        step: 1,
        precision: 0
      }
    },
    {
      label: "前哨淋巴结转移数量",
      width: 120,
      prop: "slnMetaCount",
      valueType: "input-number",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入数量",
        step: 1,
        precision: 0
      }
    },
    {
      label: "前哨淋巴结微转移数量",
      width: 120,
      prop: "slnMicroMetaCount",
      valueType: "input-number",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入数量",
        step: 1,
        precision: 0
      }
    },
    {
      label: "前哨淋巴结ITC数量",
      width: 120,
      prop: "slnItcCount",
      valueType: "input-number",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入数量",
        step: 1,
        precision: 0
      }
    },
    {
      label: "是否腋窝淋巴结清扫",
      width: 120,
      prop: "ald",
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
      label: "腋窝淋巴结清扫分期",
      width: 120,
      prop: "aldStage",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择"
      },
      options: [
        { label: "I", value: "I" },
        { label: "II", value: "II" },
        { label: "III", value: "III" }
      ]
    },
    {
      label: "腋窝淋巴结清扫数量",
      width: 120,
      prop: "aldCount",
      valueType: "input-number",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入数量",
        step: 1,
        precision: 0
      }
    },
    {
      label: "腋窝淋巴结转移数量",
      width: 120,
      prop: "aldMetaCount",
      valueType: "input-number",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入数量",
        step: 1,
        precision: 0
      }
    },
    {
      label: "腋窝淋巴结微转移数量",
      width: 120,
      prop: "aldMicroMetaCount",
      valueType: "input-number",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入数量",
        step: 1,
        precision: 0
      }
    },
    {
      label: "腋窝淋巴结ITC数量",
      width: 120,
      prop: "aldItcCount",
      valueType: "input-number",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入数量",
        step: 1,
        precision: 0
      }
    },
    {
      label: "顶端淋巴结转移",
      width: 120,
      prop: "apexMeta",
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
      label: "内乳淋巴结转移",
      width: 120,
      prop: "imMeta",
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
      label: "免疫组化结果",
      width: 120,
      prop: "ihcResult",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择"
      },
      options: [
        { label: "阴性", value: 0 },
        { label: "阳性", value: 1 }
      ]
    },
    {
      label: "ER百分比",
      width: 120,
      prop: "erPct",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入百分比",
        step: 0.1,
        precision: 1,
        min: 0,
        max: 100
      }
    },
    {
      label: "PR百分比",
      width: 120,
      prop: "prPct",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入百分比",
        step: 0.1,
        precision: 1,
        min: 0,
        max: 100
      }
    },
    {
      label: "HER2",
      width: 120,
      prop: "her2",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择"
      },
      options: [
        { label: "0", value: "0" },
        { label: "1+", value: "1+" },
        { label: "2+", value: "2+" },
        { label: "3+", value: "3+" }
      ]
    },
    {
      label: "Ki67百分比",
      width: 120,
      prop: "ki67Pct",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入百分比",
        step: 0.1,
        precision: 1,
        min: 0,
        max: 100
      }
    },
    {
      label: "AR百分比",
      width: 120,
      prop: "arPct",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入百分比",
        step: 0.1,
        precision: 1,
        min: 0,
        max: 100
      }
    },
    {
      label: "FISH检测",
      width: 120,
      prop: "fishTest",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择"
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
      valueType: "input",
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
        placeholder: "请选择"
      },
      options: [
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

const rules = {
  surgicalTime: [{ required: true, message: "请选择手术时间" }]
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

    const { id: _, ...updateData } = values;
    const res = await surgicalApi.surgicalUpdate(
      String(props.rowId),
      updateData
    );
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
      <el-button @click="handleEdit" type="primary" size="small">
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
