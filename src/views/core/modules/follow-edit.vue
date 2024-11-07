<script setup lang="ts">
import { reactive, ref, computed } from "vue";
// import { enableOptions } from "@/constants/constants";
import * as followApi from "@/api/core/follow";
import { message } from "@/utils/message";
import type { FormInstance } from "element-plus";
import { cloneDeep } from "@pureadmin/utils";
import dayjs from "dayjs";

const formRef = ref<FormInstance>();
const pageData: any = reactive({
  dialogVisible: false,
  title: "新增新辅助治疗信息",
  formLoading: false,
  isUpdate: false,
  flag: true,
  formData: {
    patientId: "",
    surgeryDate: "",
    afterSurgeryDate: "",
    followUpDate: "",
    followUpStatus: "",
    ultrasoundAbnormal: false,
    ultrasoundAbnormalDetail: "",
    needFurtherBiopsy: false,
    biopsyResult: "",
    metastasis: false,
    metastasisLocation: "",
    deceased: false,
    causeOfDeath: "",
    armEdema: false,
    armEdemaTreatment: false,
    chestCtAbnormal: false,
    headMrAbnormal: false,
    boneScanAbnormal: false,
    scaleRating: null,
    isChangeTreatmentPlan: null,
    currentTreatmentPlan: "",
    notes: ""
  },
  formRules: {
    patientId: [{ required: true, message: "请选择患者", trigger: "change" }],
    surgeryDate: [
      { required: true, message: "请选择手术日期", trigger: "change" }
    ],
    followUpDate: [
      { required: true, message: "请选择随访日期", trigger: "change" }
    ],
    followUpStatus: [
      { required: true, message: "请选择随访状态", trigger: "change" }
    ]
  },
  dataSource: {
    patientList: []
  }
});

const emits = defineEmits(["ok", "close", "follow-added"]);

// 计算出是否显示相关表单项
const showUltrasound = computed(
  () => pageData.formData.ultrasoundAbnormal === 1
);
const showMammogram = computed(() => pageData.formData.needFurtherBiopsy === 1);
const showMri = computed(() => pageData.formData.metastasis === 1);
const showBreastCoreBiopsy = computed(() => pageData.formData.deceased === 1);
const showAxillaryCoreBiopsy = computed(() => pageData.formData.armEdema === 1);
const showChestCtAbnormalResult = computed(
  () => pageData.formData.chestCtAbnormal === 1
);
const showHeadMrAbnormalResult = computed(
  () => pageData.formData.headMrAbnormal === 1
);
const showBoneScanAbnormalResult = computed(
  () => pageData.formData.boneScanAbnormal === 1
);
// const showAxillaryFineNeedleAspiration = computed(
//   () => pageData.formData.axillaryFineNeedleAspirationDone === true
// );
let flags = 0;

const open = (
  data?: any,
  title?: string,
  dataSource?: any,
  patientId?: number,
  flag?: number
) => {
  pageData.formData = data || {
    id: "",
    patientId: "",
    // surgeryDate: "",
    afterSurgeryDate: "",
    followUpDate: "",
    followUpStatus: "",
    ultrasoundAbnormal: 0,
    ultrasoundAbnormalDetail: "",
    needFurtherBiopsy: 0,
    biopsyResult: "",
    metastasis: 0,
    metastasisLocation: "",
    deceased: 0,
    causeOfDeath: "",
    armEdema: 0,
    armEdemaTreatment: 0,
    chestCtAbnormal: 0,
    chestCtAbnormalResult: "",
    headMrAbnormal: 0,
    headMrAbnormalResult: "",
    boneScanAbnormal: 0,
    boneScanAbnormalResult: "",
    scaleRating: null,
    isChangeTreatmentPlan: null,
    currentTreatmentPlan: "",
    notes: ""
  };
  flags = flag;
  console.log(flags);
  if (flags != 0) {
    pageData.flag = false;
  } else {
    pageData.flag = true;
  }
  if (
    pageData.formData.patientId == "" ||
    pageData.formData.patientId == null
  ) {
    pageData.formData.patientId = patientId;
  }
  pageData.dataSource = dataSource;
  console.log(data);
  console.log(pageData.dataSource);
  console.log(flags);
  pageData.title = title || "新增随访记录";
  pageData.isUpdate = true;
  // pageData.isUpdate = !!pageData.formData.id;
  pageData.dialogVisible = true;
};

const handleClose = () => {
  pageData.dialogVisible = false;
  const _data = cloneDeep(pageData.formData);
  emits("follow-added", _data.patientId);
  emits("close");
};

const handleConfirm = () => {
  formRef.value!.validate((isValid: boolean) => {
    if (isValid) {
      const { id } = pageData.formData;
      if (id) {
        if (flags != 0) {
          _update();
        } else {
          _record();
        }
      } else {
        _save();
      }
    } else {
      message("请填写所有的必选项！", { type: "warning" });
    }
  });
};

const _save = () => {
  pageData.formLoading = true;
  const _data = cloneDeep(pageData.formData);
  // 格式化日期字段
  // _data.surgeryDate = dayjs(_data.surgeryDate).format("YYYY-MM-DD");
  _data.followUpDate = dayjs(_data.followUpDate).format("YYYY-MM-DD");
  followApi
    .followSave(_data)
    .then((res: any) => {
      if (res.success) {
        _confirm();
        message("新增成功!", { type: "success" });
        emits("follow-added", _data.patientId);
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
  // 格式化日期字段
  // _data.surgeryDate = dayjs(_data.surgeryDate).format("YYYY-MM-DD");
  _data.followUpDate = dayjs(_data.followUpDate).format("YYYY-MM-DD");
  followApi
    .followUpdate(pageData.formData.id, _data)
    .then((res: any) => {
      if (res.success) {
        _confirm();
        message("修改成功!", { type: "success" });
        emits("follow-added", _data.patientId);
      } else {
        message(res.message, { type: "warning" });
      }
    })
    .finally(() => {
      pageData.formLoading = false;
    });
};

const _record = () => {
  pageData.formLoading = true;
  const _data = cloneDeep(pageData.formData);
  _data.followUpDate = dayjs(_data.followUpDate).format("YYYY-MM-DD");
  followApi
    .followRecord(pageData.formData.id, _data)
    .then((res: any) => {
      if (res.success) {
        _confirm();
        message("记录成功!", { type: "success" });
        emits("follow-added", _data.patientId);
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
defineOptions({ name: "RoleEdit" });
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
        <el-form-item label="患者" prop="patientId">
          <el-select
            v-model="pageData.formData.patientId"
            clearable
            placeholder="请选择该病历的患者"
            style="width: 70%"
            :disabled="pageData.isUpdate"
          >
            <el-option
              v-for="item in pageData.dataSource.patientList"
              :label="item.name"
              :key="item.id"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <!-- ... 其他表单项 -->
        <!-- <el-form-item label="手术日期" prop="surgeryDate">
          <el-date-picker
            v-model="pageData.formData.surgeryDate"
            type="date"
            clearable
            placeholder="请选择手术日期"
            style="width: 70%"
          />
        </el-form-item> -->
        <el-form-item label="随访日期" prop="followUpDate">
          <el-date-picker
            v-model="pageData.formData.followUpDate"
            type="date"
            clearable
            placeholder="请选择随访日期"
            valueFormat="YYYY-MM-DD"
            style="width: 70%"
            :disabled="pageData.flag"
          />
        </el-form-item>
        <el-form-item label="随访状态" prop="followUpStatus">
          <el-select
            v-model="pageData.formData.followUpStatus"
            clearable
            placeholder="请选择随访状态"
            style="width: 70%"
            :disabled="pageData.flag"
          >
            <el-option label="等待中" value="等待中" />
            <el-option label="待随访" value="待随访" />
            <el-option label="已完成" value="已完成" />
          </el-select>
        </el-form-item>
        <el-form-item label="超声是否异常" prop="ultrasoundAbnormal">
          <el-select
            v-model="pageData.formData.ultrasoundAbnormal"
            clearable
            placeholder="请选择超声是否异常"
            style="width: 70%"
          >
            <el-option label="是" :value="1" />
            <el-option label="否" :value="0" />
          </el-select>
        </el-form-item>

        <template v-if="showUltrasound">
          <el-form-item label="超声异常明细" prop="ultrasoundAbnormalDetail">
            <el-input
              v-model="pageData.formData.ultrasoundAbnormalDetail"
              clearable
              placeholder="请输入超声异常明细"
              style="width: 70%"
            />
          </el-form-item>
        </template>

        <el-form-item label="是否需进一步穿刺" prop="needFurtherBiopsy">
          <el-select
            v-model="pageData.formData.needFurtherBiopsy"
            clearable
            placeholder="请选择是否需进一步穿刺"
            style="width: 70%"
          >
            <el-option label="是" :value="1" />
            <el-option label="否" :value="0" />
          </el-select>
        </el-form-item>

        <template v-if="showMammogram">
          <el-form-item label="穿刺结果" prop="biopsyResult">
            <el-input
              v-model="pageData.formData.biopsyResult"
              clearable
              placeholder="请输入穿刺结果"
              style="width: 70%"
            />
          </el-form-item>
        </template>

        <el-form-item label="是否有转移" prop="metastasis">
          <el-select
            v-model="pageData.formData.metastasis"
            clearable
            placeholder="请选择是否有转移"
            style="width: 70%"
          >
            <el-option label="是" :value="1" />
            <el-option label="否" :value="0" />
          </el-select>
        </el-form-item>

        <template v-if="showMri">
          <el-form-item label="转移部位" prop="metastasisLocation">
            <el-input
              v-model="pageData.formData.metastasisLocation"
              clearable
              placeholder="请输入转移部位"
              style="width: 70%"
            />
          </el-form-item>
        </template>

        <el-form-item label="是否已故" prop="deceased">
          <el-select
            v-model="pageData.formData.deceased"
            clearable
            placeholder="请选择是否已故"
            style="width: 70%"
          >
            <el-option label="是" :value="1" />
            <el-option label="否" :value="0" />
          </el-select>
        </el-form-item>

        <template v-if="showBreastCoreBiopsy">
          <el-form-item label="已故原因" prop="causeOfDeath">
            <el-input
              v-model="pageData.formData.causeOfDeath"
              clearable
              placeholder="请输入已故原因"
              style="width: 70%"
            />
          </el-form-item>
        </template>

        <el-form-item label="是否术后患侧上肢水肿" prop="armEdema">
          <el-select
            v-model="pageData.formData.armEdema"
            clearable
            placeholder="请选择是否术后患侧上肢水肿"
            style="width: 70%"
          >
            <el-option label="是" :value="1" />
            <el-option label="否" :value="0" />
          </el-select>
        </el-form-item>

        <template v-if="showAxillaryCoreBiopsy">
          <el-form-item
            label="是否行针对上肢水肿的治疗"
            prop="armEdemaTreatment"
          >
            <el-select
              v-model="pageData.formData.armEdemaTreatment"
              clearable
              placeholder="请选择是否行针对上肢水肿的治疗"
              style="width: 70%"
            >
              <el-option label="是" :value="1" />
              <el-option label="否" :value="0" />
            </el-select>
          </el-form-item>
        </template>
        <el-form-item label="X月复查胸部CT是否异常" prop="chestCtAbnormal">
          <el-select
            v-model="pageData.formData.chestCtAbnormal"
            clearable
            placeholder="请选择X月复查胸部CT是否异常"
            style="width: 70%"
          >
            <el-option label="是" :value="1" />
            <el-option label="否" :value="0" />
          </el-select>
        </el-form-item>
        <template v-if="showChestCtAbnormalResult">
          <el-form-item
            label="X月复查胸部CT异常结果"
            prop="chestCtAbnormalResult"
          >
            <el-input
              v-model="pageData.formData.chestCtAbnormalResult"
              clearable
              placeholder="请输入异常结果"
              style="width: 70%"
            />
          </el-form-item>
        </template>
        <el-form-item label="X月复查头颅MR是否异常" prop="headMrAbnormal">
          <el-select
            v-model="pageData.formData.headMrAbnormal"
            clearable
            placeholder="请选择X月复查头颅MR是否异常"
            style="width: 70%"
          >
            <el-option label="是" :value="1" />
            <el-option label="否" :value="0" />
          </el-select>
        </el-form-item>
        <template v-if="showHeadMrAbnormalResult">
          <el-form-item
            label="X月复查头颅MR异常结果"
            prop="headMrAbnormalResult"
          >
            <el-input
              v-model="pageData.formData.headMrAbnormalResult"
              clearable
              placeholder="请输入异常结果"
              style="width: 70%"
            />
          </el-form-item>
        </template>
        <el-form-item label="X月复查全身骨扫描是否异常" prop="boneScanAbnormal">
          <el-select
            v-model="pageData.formData.boneScanAbnormal"
            clearable
            placeholder="请选择X月复查全身骨扫描是否异常"
            style="width: 70%"
          >
            <el-option label="是" :value="1" />
            <el-option label="否" :value="0" />
          </el-select>
        </el-form-item>
        <template v-if="showBoneScanAbnormalResult">
          <el-form-item
            label="X月复查胸部CT异常结果"
            prop="boneScanAbnormalResult"
          >
            <el-input
              v-model="pageData.formData.boneScanAbnormalResult"
              clearable
              placeholder="请输入异常结果"
              style="width: 70%"
            />
          </el-form-item>
        </template>
        <el-form-item label="量表评分" prop="scaleRating">
          <el-input
            v-model="pageData.formData.scaleRating"
            clearable
            placeholder="请输入量表评分"
            style="width: 70%"
          />
        </el-form-item>
        <el-form-item label="是否更改治疗方案" prop="isChangeTreatmentPlan">
          <el-select
            v-model="pageData.formData.isChangeTreatmentPlan"
            clearable
            placeholder="请选择是否更改治疗方案"
            style="width: 70%"
          >
            <el-option label="是" :value="1" />
            <el-option label="否" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="当前治疗方案" prop="currentTreatmentPlan">
          <el-input
            v-model="pageData.formData.currentTreatmentPlan"
            clearable
            placeholder="请输入当前治疗方案"
            style="width: 70%"
          />
        </el-form-item>
        <el-form-item label="备注" prop="notes">
          <el-input
            v-model="pageData.formData.notes"
            clearable
            placeholder="请输入备注"
            style="width: 70%"
          />
        </el-form-item>
        <!-- 其他表单项 -->
      </el-form>
    </div>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确认</el-button>
    </template>
  </el-dialog>
</template>
<style scoped></style>
