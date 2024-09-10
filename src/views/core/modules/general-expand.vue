<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  PlusForm,
  type PlusColumn,
  type FieldValues
} from "plus-pro-components";
import * as generalApi from "@/api/core/general";
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

// 监听 prop 变化，更新本地数据
watch(
  () => props.formData,
  newValue => {
    localFormData.value = { ...newValue };
  },
  { deep: true }
);

// 一般资料表单列定义
const generalFormColumns = computed((): PlusColumn[] => {
  return [
    {
      label: "手术编号",
      width: 120,
      prop: "surgicalNum",
      valueType: "copy",
      tooltip: "A + 手术日期 + 数字",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入手术编号"
      },
      rules: [
        { required: true, message: "请输入手术编号", trigger: "blur" },
        {
          validator: (rule, value, callback) =>
            checkSurgicalNum(rule, value, callback, localFormData.value?.id),
          trigger: "blur"
        }
      ]
    },
    {
      label: "病案号",
      width: 120,
      prop: "caseNo",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入病案号"
      }
    }
  ];
});

const rules = {
  surgicalNum: [{ required: true, message: "请输入手术编号", trigger: "blur" }]
};

const checkSurgicalNum = (rule: any, value: any, callback: any, id: number) => {
  if (value === "") {
    callback(new Error("请输入手术编号"));
  } else {
    generalApi
      .checkCode(value, String(id))
      .then((res: any) => {
        if (res.success) {
          if (res.result) {
            callback(new Error("手术编号重复"));
          } else {
            callback();
          }
        } else {
          callback(new Error("验证失败,请重试"));
        }
      })
      .catch(() => {
        callback(new Error("验证失败,请重试"));
      });
  }
};

const handleGeneralEdit = () => {
  if (hasAuth(props.permissions.general_update)) {
    emit("update:isEditing", !props.isEditing);
  } else {
    ElMessage.error("您没有编辑权限");
  }
};

const handleFormChange = (values: FieldValues) => {
  localFormData.value = { ...localFormData.value, ...values };
  emit("update:formData", localFormData.value);
};

const handleGeneralFormSubmit = async (values: FieldValues): Promise<void> => {
  try {
    if (!props.isEditing) {
      ElMessage.warning("当前行不处于编辑状态,无法提交");
      return;
    }

    const { id, ...updateData } = values;
    const res = await generalApi.generalUpdate(String(id), updateData);
    if (res.success) {
      ElMessage.success("一般资料提交成功");
      localFormData.value = { ...values };
      emit("update:formData", localFormData.value);
    } else {
      throw new Error(res.message || "未知错误");
    }
  } catch (error) {
    console.error("一般资料提交失败", error);
    // ElMessage.error(`一般资料提交失败：${error.message || "请重试"}`);
  } finally {
    emit("update:isEditing", false);
  }
};

const handleGeneralFormReset = (): void => {
  if (!props.isEditing) {
    ElMessage.warning("当前不处于编辑状态，无法重置");
    return;
  }
  localFormData.value = {
    surgicalNum: "",
    caseNo: ""
  };
  emit("update:formData", localFormData.value);
};
</script>

<template>
  <div>
    <div class="form-header">
      <h3>一般资料</h3>
      <el-button @click="handleGeneralEdit" type="primary" size="small">
        {{ isEditing ? "取消编辑" : "编辑" }}
      </el-button>
    </div>
    <PlusForm
      v-if="localFormData"
      :key="`general-${rowId}`"
      v-model="localFormData"
      class="w-[80%] max-w-[1000px] m-auto"
      :columns="generalFormColumns"
      :rules="rules"
      label-position="right"
      @change="handleFormChange"
      :disabled="!isEditing"
      lazy
      @submit="handleGeneralFormSubmit"
      @reset="handleGeneralFormReset"
      submitText="提交一般资料"
      resetText="重置一般资料"
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
