<script setup lang="ts">
import { reactive, ref } from "vue";
import { sexOptions } from "@/constants/constants";
import * as patientApi from "@/api/core/patient";
import { message } from "@/utils/message";
import type { FormInstance } from "element-plus";
import { cloneDeep } from "@pureadmin/utils";
// const checkRoleCode = (rule: any, value: any, callback: any) => {
//   if (value === "") {
//     callback(new Error("请输入角色编码"));
//   } else {
//     const id = pageData.formData.id;
//     patientApi.checkCode(value, id).then((res: any) => {
//       if (res.success) {
//         if (res.result) {
//           callback(new Error("编码重复"));
//         }
//       }
//     });
//     callback();
//   }
// };
const formRef = ref<FormInstance>();
const pageData: any = reactive({
  dialogVisible: false,
  title: "新增患者信息",
  formLoading: false,
  isUpdate: false,
  formData: {
    name: "",
    sex: "",
    age: "",
    phone: "",
    contactPhone: "",
    address: "",
    height: "",
    weight: ""
  },
  formRules: {
    name: [{ required: true, message: "请输入患者姓名", trigger: "blur" }],
    sex: [{ required: true, message: "请选择性别", trigger: "change" }],
    age: [{ required: true, message: "请输入年龄", trigger: "blur" }]
  }
});
const emits = defineEmits(["ok", "close"]);
const open = (data?: any, title?: string) => {
  pageData.formData = data || {
    name: "",
    sex: "",
    age: "",
    phone: "",
    contactPhone: "",
    address: "",
    height: "",
    weight: ""
  };
  pageData.title = title || "新增患者信息";
  pageData.isUpdate = !!pageData.formData.id;
  pageData.dialogVisible = true;
};
const handleClose = () => {
  pageData.dialogVisible = false;
  emits("close");
};
const handleConfirm = () => {
  formRef.value!.validate((isValid: boolean) => {
    if (isValid) {
      const { id } = pageData.formData;
      if (id) {
        _update();
      } else {
        _save();
      }
    } else {
      message("表单校验失败", { type: "warning" });
    }
  });
};
const _save = () => {
  pageData.formLoading = true;
  const _data = cloneDeep(pageData.formData);
  patientApi
    .patientSave(_data)
    .then((res: any) => {
      if (res.success) {
        _confirm();
        message("新增成功", { type: "success" });
      } else {
        message(res.message, { type: "warning" });
      }
    })
    .finally(() => {
      pageData.formLoading = false;
    });
};
const _update = () => {
  pageData.formLoading = true;
  const _data = cloneDeep(pageData.formData);
  patientApi
    .patientUpdate(pageData.formData.id, _data)
    .then((res: any) => {
      if (res.success) {
        _confirm();
        message("修改成功", { type: "success" });
      } else {
        message(res.message, { type: "warning" });
      }
    })
    .finally(() => {
      pageData.formLoading = false;
    });
};
const _confirm = () => {
  pageData.dialogVisible = false;
  emits("ok");
};
defineExpose({ open });
defineOptions({ name: "PatientEdit" });
</script>

<template>
  <el-dialog
    v-model="pageData.dialogVisible"
    :title="pageData.title"
    destroy-on-close
    :width="800"
    class="el-dialog-header"
  >
    <div class="el-dialog-content">
      <el-form
        :model="pageData.formData"
        style="width: 70%"
        label-width="auto"
        :rules="pageData.formRules"
        ref="formRef"
        :loading="pageData.formLoading"
      >
        <el-form-item label="患者姓名" prop="name">
          <el-input
            v-model="pageData.formData.name"
            clearable
            placeholder="请输入患者姓名"
            :disabled="pageData.isUpdate"
          />
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-radio-group v-model="pageData.formData.sex">
            <el-radio
              v-for="(item, index) in sexOptions"
              :label="item.value"
              :key="index"
              >{{ item.label }}</el-radio
            >
          </el-radio-group>
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input
            v-model="pageData.formData.age"
            clearable
            placeholder="请输入年龄"
          />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input
            v-model="pageData.formData.phone"
            clearable
            placeholder="请输入电话"
          />
        </el-form-item>
        <el-form-item label="联系人电话" prop="contactPhone">
          <el-input
            v-model="pageData.formData.contactPhone"
            clearable
            placeholder="请输入年龄"
          />
        </el-form-item>
        <el-form-item label="住址" prop="address">
          <el-input
            type="textarea"
            v-model="pageData.formData.address"
            :autosize="{ minRows: 3 }"
            clearable
            placeholder="文本输入，不得超过200"
            max="200"
          />
        </el-form-item>
        <el-form-item label="身高" prop="height">
          <el-input
            v-model="pageData.formData.height"
            clearable
            placeholder="请输入身高"
          />
        </el-form-item>
        <el-form-item label="体重" prop="weight">
          <el-input
            v-model="pageData.formData.weight"
            clearable
            placeholder="请输入体重"
          />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确认</el-button>
    </template>
  </el-dialog>
</template>

<style scoped></style>
