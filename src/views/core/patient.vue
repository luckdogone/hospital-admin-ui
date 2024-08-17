<script setup lang="ts">
import { reactive, onMounted, ref } from "vue";
import { PureTable } from "@pureadmin/table";
import {
  PlusForm,
  type PlusColumn,
  type FieldValues
} from "plus-pro-components";
import { CollapseModelValue } from "element-plus";
import FormSearch from "@/components/opts/form-search.vue";
import TableButtons from "@/components/opts/btns2.vue";
import PatientEdit from "./modules/patient-edit.vue";
import { hasAuth } from "@/router/utils";
import { enableConvert, enabledBooleanConvert } from "@/constants/convert";
import { enableOptions } from "@/constants/constants";
import * as patientApi from "@/api/core/patient";
import * as generalApi from "@/api/core/general";
import * as caseApi from "@/api/core/case";
import "plus-pro-components/es/components/form/style/css";
import { ElMessage } from "element-plus";
import message from "@/utils/message";
import GeneralInfo from "./modules/general-expand.vue";
import CaseInfo from "./modules/case-expand.vue";

defineOptions({ name: "corePatient" });

// 引用和状态
const patientEditRef = ref();
// const currentRowId = ref(null);
const rowActiveNames = ref<{ [key: number]: CollapseModelValue }>({});
const rowDataLoading = ref<{
  [key: number]: { general: boolean; case: boolean };
}>({});
const expandedFormData = reactive<{ [key: number]: any }>({});

// 页面数据
const pageData: any = reactive({
  permission: {
    query: [],
    add: ["patient:save"],
    update: ["patient:update"],
    delete: ["patient:del"],
    general_update: ["general:update"],
    case_update: ["general:update"]
  },
  searchState: true,
  searchField: [
    {
      type: "input",
      label: "角色编码",
      prop: "roleCode",
      placeholder: "精准查询角色编码"
    },
    {
      type: "input",
      label: "角色名称",
      prop: "roleName",
      placeholder: "模糊查询角色名称"
    },
    {
      type: "select",
      label: "状态",
      prop: "enabled",
      placeholder: "请选择",
      dataSourceKey: "enabledOptions",
      options: {
        keys: {
          label: "label",
          value: "value",
          prop: "value"
        },
        filterable: true
      }
    }
  ],
  dataSource: {
    enabledOptions: enableOptions
  },
  searchForm: {},
  btnOpts: {
    left: [
      {
        key: "add",
        label: "新增",
        type: "primary",
        icon: "ep:plus",
        state: true,
        permission: ["patient:save"]
      }
    ],
    right: [
      {
        key: "search",
        label: "查询",
        icon: "ep:search",
        state: true,
        options: {
          circle: true
        }
      },
      {
        key: "refresh",
        label: "刷新",
        icon: "ep:refresh",
        state: true,
        options: {
          circle: true
        }
      }
    ]
  },
  tableParams: {
    columns: [
      // ... 表格列配置（保持不变）
    ],
    list: [],
    loading: false,
    pagination: {
      pageSize: 10,
      currentPage: 1,
      total: 0
    }
  }
});

// 表格列定义
const tableColumns: TableColumnList = [
  {
    type: "expand",
    slot: "expand"
  },
  {
    label: "姓名",
    prop: "name"
  },
  {
    label: "性别",
    prop: "sex",
    formatter: row => (row.sex === 0 ? "女" : "男")
  },
  {
    label: "年龄",
    prop: "age"
  },
  {
    label: "电话",
    prop: "phone"
  },
  {
    label: "联系人电话",
    prop: "contactPhone"
  },
  {
    label: "录入状态",
    prop: "inputStatus",
    formatter: row => {
      const statusMap = {
        0: "未开始",
        1: "进行中",
        2: "已完成"
      };
      return statusMap[row.inputStatus] || "未知";
    }
  },
  {
    label: "操作",
    fixed: "right",
    slot: "operation"
  }
];

// 表单验证规则
const rules = {
  name: [{ required: true, message: "请输入名称" }],
  surgicalNum: [{ required: true, message: "请输入手术编号", trigger: "blur" }]
};

// 主表单列定义
const mainFormColumns: PlusColumn[] = [
  {
    label: "患者姓名",
    width: 120,
    prop: "name",
    valueType: "copy",
    colProps: { span: 12 },
    fieldProps: {
      placeholder: "请输入患者姓名"
    }
  },
  {
    label: "性别",
    width: 120,
    prop: "sex",
    valueType: "select",
    colProps: { span: 12 },
    fieldProps: {
      placeholder: "请选择性别"
    },
    options: [
      {
        label: "男",
        value: 1,
        color: "red"
      },
      {
        label: "女",
        value: 0,
        color: "blue"
      }
    ]
  },
  {
    label: "年龄",
    prop: "age",
    valueType: "input-number",
    colProps: { span: 12 },
    fieldProps: { step: 1 }
  },
  {
    label: "电话",
    width: 120,
    prop: "phone",
    valueType: "copy",
    colProps: { span: 12 },
    fieldProps: {
      placeholder: "请输入电话" // 直接设置placeholder
    }
  },
  {
    label: "联系人电话",
    width: 120,
    prop: "contactPhone",
    valueType: "copy",
    fieldProps: {
      placeholder: "请输入联系人电话" // 直接设置placeholder
    }
  },
  {
    label: "住址",
    prop: "address",
    valueType: "textarea",
    fieldProps: {
      placeholder: "请输入住址",
      maxlength: 100,
      showWordLimit: true,
      autosize: { minRows: 2, maxRows: 4 }
    }
  },
  {
    label: "身高",
    width: 120,
    prop: "height",
    valueType: "input-number",
    colProps: { span: 12 },
    fieldProps: {
      placeholder: "请输入身高" // 直接设置placeholder
    }
  },
  {
    label: "体重",
    width: 120,
    prop: "weight",
    valueType: "copy",
    colProps: { span: 12 },
    fieldProps: {
      placeholder: "请输入体重" // 直接设置placeholder
    }
  },
  {
    label: "BMI指数",
    prop: "bmi",
    valueType: "input-number",
    fieldProps: { precision: 2, step: 1 }
  }
];

// 功能函数
const updateSearchForm = (data: any) => {
  pageData.searchForm = data;
};

const handleSearch = () => {
  loadTableData();
};

const resetSearch = (data?: any) => {
  pageData.searchForm = data || {};
};

const toggleSearchState = () => {
  pageData.searchState = !pageData.searchState;
};

const handlePageChange = (current: number, size: number) => {
  pageData.tableParams.pagination.currentPage = current;
  pageData.tableParams.pagination.pageSize = size;
  loadTableData();
};

/**
 * 删除
 */
const handleDel = (record: any) => {
  message.confirm("确认删除当前数据").then(() => {
    _delete([record.id]);
  });
};
const _delete = (ids: any[]) => {
  if (ids && ids.length > 0) {
    pageData.tableParams.loading = true;
    patientApi
      .patientDel(ids)
      .then(res => {
        if (res.success) {
          message.success("删除成功");
          loadTableData();
        } else {
          message.warning(res.message);
        }
      })
      .finally(() => {
        pageData.tableParams.loading = false;
      });
  }
};

//表格数据加载函数
const loadTableData = () => {
  pageData.tableParams.loading = true;
  const query = {
    ...pageData.searchForm,
    current: pageData.tableParams.pagination.currentPage,
    size: pageData.tableParams.pagination.pageSize
  };

  patientApi
    .patientQueryPage(query)
    .then((res: any) => {
      if (res.success) {
        pageData.tableParams.list = res.result.records;
        pageData.tableParams.pagination.total = Number(res.result.total);
      }
    })
    .finally(() => {
      pageData.tableParams.loading = false;
    });
};

//按钮跳转
const handleBtnClick = (action: string) => {
  switch (action) {
    case "add":
      patientEditRef.value?.open();
      break;
    case "search":
      toggleSearchState();
      break;
    case "refresh":
      loadTableData();
      break;
  }
};

//编辑函数
const handleEdit = (row: any, type: "general" | "case" | "main") => {
  if (hasAuth(pageData.permission.update) && row.isSystem !== 1) {
    editState[type][String(row.id)] = !editState[type][String(row.id)];
    // 更新表单项的禁用状态
    expandedFormData[row.id][type] = {
      ...expandedFormData[row.id][type],
      disabled: !editState[type][String(row.id)]
    };
  } else {
    ElMessage.error("您没有编辑权限");
  }
};

// 处理折叠面板变化
const handleCollapseChange = (val: CollapseModelValue, rowId: number) => {
  rowActiveNames.value[rowId] = val;
  if (Array.isArray(val)) {
    if (val.includes("1") && !expandedFormData[rowId].general.surgicalNum) {
      loadGeneralData(rowId);
    }
    if (
      val.includes("2") &&
      !expandedFormData[rowId].case.admissionUltrasound
    ) {
      loadCaseData(rowId);
    }
  }
};

// 加载一般资料
const loadGeneralData = (id: number) => {
  if (!rowDataLoading.value[id]) {
    rowDataLoading.value[id] = { general: false, case: false };
  }
  rowDataLoading.value[id].general = true;

  const query = { patientId: id };

  generalApi
    .generalQueryList(query)
    .then((res: any) => {
      if (res.success && res.result.length > 0) {
        const generalData = res.result[0]; // 假设我们只需要第一条记录

        // 创建一个新的对象来存储一般资料，而不是直接修改 expandedFormData
        const newGeneralData = {
          surgicalNum: generalData.surgicalNum,
          caseNo: generalData.caseNo,
          patientId: generalData.patientId,
          id: generalData.id
          // 可以根据需要添加其他字段
        };

        // 更新 expandedFormData，但保持原始数据不变
        expandedFormData[id] = {
          ...expandedFormData[id],
          general: { ...newGeneralData },
          originalGeneral: { ...newGeneralData } // 保存原始数据
        };
      } else {
        // 如果没有数据，设置为空对象
        expandedFormData[id] = {
          ...expandedFormData[id],
          general: {},
          originalGeneral: {}
        };
      }
    })
    .catch(error => {
      console.error("Failed to load general data:", error);
      // 出错时也设置为空对象
      expandedFormData[id] = {
        ...expandedFormData[id],
        general: {},
        originalGeneral: {}
      };
    })
    .finally(() => {
      rowDataLoading.value[id].general = false;
    });
};

// 加载病历资料
const loadCaseData = (id: number) => {
  if (!rowDataLoading.value[id]) {
    rowDataLoading.value[id] = { general: false, case: false };
  }
  rowDataLoading.value[id].case = true;

  const query = { patientId: id };

  caseApi
    .caseQueryList(query)
    .then((res: any) => {
      if (res.success && res.result.length > 0) {
        const caseData = res.result[0]; // 假设我们只需要第一条记录

        // 创建一个新的对象来存储一般资料，而不是直接修改 expandedFormData
        const newCaseData = {
          // 基础信息
          id: caseData.id,
          patientId: caseData.patientId,

          // 入院超声检查
          ultrasoundStatus: caseData.ultrasoundStatus,
          ultrasoundSize: caseData.ultrasoundSize,
          ultrasoundBloodFlow: caseData.ultrasoundBloodFlow,
          ultrasoundBirads: caseData.ultrasoundBirads,

          // 入院钼靶检查
          mammographyStatus: caseData.mammographyStatus,
          mammographySize: caseData.mammographySize,
          mammographyAggregation: caseData.mammographyAggregation,
          mammographyBirads: caseData.mammographyBirads,

          // 入院乳腺核磁检查
          mriStatus: caseData.mriStatus,
          mriSize: caseData.mriSize,
          mriBloodFlow: caseData.mriBloodFlow,
          mriBirads: caseData.mriBirads,

          // 血常规检查
          wbc: caseData.wbc,
          rbc: caseData.rbc,
          platelets: caseData.platelets,

          // 肝功能检查
          alt: caseData.alt,
          ast: caseData.ast,
          alkalinePhosphatase: caseData.alkalinePhosphatase,

          // 肾功能检查
          creatinine: caseData.creatinine,
          bun: caseData.bun,
          uricAcid: caseData.uricAcid,

          // 血脂检查
          triglycerides: caseData.triglycerides,
          ldl: caseData.ldl,

          // D-二聚体检查
          dimer: caseData.dimer,

          // 肿瘤标志物检查
          cea: caseData.cea,
          ca153: caseData.ca153,
          ca125: caseData.ca125,

          // 乳腺粗针穿刺病理结果
          breastCoreNeedle: caseData.breastCoreNeedle,
          breastCoreNeedleResult: caseData.breastCoreNeedleResult,

          // 腋窝粗针穿刺病理结果
          axillaryCoreNeedle: caseData.axillaryCoreNeedle,
          axillaryCoreNeedleResult: caseData.axillaryCoreNeedleResult,

          // 腋窝细针穿刺病理结果
          axillaryFineNeedle: caseData.axillaryFineNeedle,
          axillaryFineNeedleResult: caseData.axillaryFineNeedleResult,

          // 免疫组化结果
          ihcResult: caseData.ihcResult,
          erPct: caseData.erPct,
          prPct: caseData.prPct,
          her2: caseData.her2,
          ki67Pct: caseData.ki67Pct,
          arPct: caseData.arPct,
          fishTest: caseData.fishTest,

          // TNM分期
          tnm: caseData.tnm,
          stage: caseData.stage,

          // 亚型分型
          subtype: caseData.subtype,

          // 入录信息
          inputStatus: caseData.inputStatus,
          createdBy: caseData.createdBy,
          created: caseData.created,
          modifiedBy: caseData.modifiedBy,
          modified: caseData.modified,
          isEnable: caseData.isEnable,
          isDel: caseData.isDel
        };

        // 更新 expandedFormData，但保持原始数据不变
        expandedFormData[id] = {
          ...expandedFormData[id],
          case: { ...newCaseData },
          originalCase: { ...newCaseData } // 保存原始数据
        };
      } else {
        // 如果没有数据，设置为空对象
        expandedFormData[id] = {
          ...expandedFormData[id],
          case: {},
          originalCase: {}
        };
      }
    })
    .catch(error => {
      console.error("Failed to load case data:", error);
      // 出错时也设置为空对象
      expandedFormData[id] = {
        ...expandedFormData[id],
        case: {},
        originalGeneral: {}
      };
    })
    .finally(() => {
      rowDataLoading.value[id].case = false;
    });
};

// 处理展开/折叠
const handleExpand = (row: any, expanded: boolean) => {
  if (expanded) {
    if (!expandedFormData[row.id]) {
      expandedFormData[row.id] = {
        main: { ...row, disabled: true },
        general: {},
        case: {}
      };
    }
    if (!rowActiveNames.value[row.id]) {
      rowActiveNames.value[row.id] = [];
    }
    if (!rowDataLoading.value[row.id]) {
      rowDataLoading.value[row.id] = { general: false, case: false };
    }
    // 当展开行时，立即加载数据
    loadGeneralData(row.id);
    loadCaseData(row.id);
  }
};

// 编辑状态
const editState: { [key: string]: { [key: string]: boolean } } = reactive({
  general: {},
  case: {},
  main: {}
});

// 主表单处理函数
const handleMainFormSubmit = (values: FieldValues): Promise<void> => {
  try {
    pageData.tableParams.loading = true;
    // 获取当前行的编辑状态
    const rowId = String(values.id);
    if (!editState.main[rowId]) {
      ElMessage.warning("当前行不处于编辑状态,无法提交");
      return;
    }

    console.log("主表单提交:", values);

    const { id: _, ...updateData } = values;

    patientApi
      .patientUpdate(rowId, updateData)
      .then(res => {
        if (res.success) {
          ElMessage.success("主表单提交成功");
          // 更新本地数据
          expandedFormData[rowId].main = { ...values };
          // 可能需要重新加载表格数据
          // loadTableData();
        } else {
          throw new Error(res.message || "未知错误");
        }
      })
      .catch(error => {
        console.error("主表单提交失败", error);
        ElMessage.error(`主表单提交失败：${error.message || "请重试"}`);
      })
      .finally(() => {
        // 退出编辑状态
        editState.main[rowId] = false;
        // 恢复表单项的禁用状态
        expandedFormData[rowId].main.disabled = true;
        pageData.tableParams.loading = false;
      });
    // await someApiCall(values);
    // ElMessage.success("主表单提交成功");

    // 更新本地数据
    // expandedFormData[rowId].main = { ...values };
  } catch (error) {
    console.error("主表单提交失败", error);
    ElMessage.error("主表单提交失败,请重试");
  }
};

// 修改主表单重置函数
const handleMainFormReset = (rowId: string): void => {
  // 获取原始数据
  const originalData =
    pageData.tableParams.list.find(item => item.id === Number(rowId)) || {};

  // 定义主表单的字段
  const mainFormFields = [
    "name",
    "sex",
    "age",
    "phone",
    "contactPhone",
    "address",
    "height",
    "weight",
    "bmi"
  ];

  // 只重置主表单的字段
  const resetData = {
    ...expandedFormData[rowId], // 保留现有的其他数据
    ...Object.fromEntries(
      mainFormFields.map(field => [field, originalData[field] || ""])
    ),
    id: Number(rowId),
    disabled: true // 重置后设置为禁用状态
  };

  // 更新 expandedFormData
  expandedFormData[rowId] = resetData;

  // 退出编辑状态
  editState.main[rowId] = false;
};

onMounted(() => {
  loadTableData();
});
</script>

<template>
  <el-card :shadow="'never'">
    <template #default>
      <form-search
        :show="pageData.searchState"
        :form-field="pageData.searchField"
        :data-source="pageData.dataSource"
        @search-form="updateSearchForm"
        @search="handleSearch"
        @reset="resetSearch"
        :query-permission="pageData.permission.query"
      />
      <table-buttons
        :size="'small'"
        :left-btns="pageData.btnOpts.left"
        :right-btns="pageData.btnOpts.right"
        @click="handleBtnClick"
      />
      <pure-table
        :columns="tableColumns"
        :data="pageData.tableParams.list"
        :border="true"
        :stripe="true"
        :loading="pageData.tableParams.loading"
        :pagination="pageData.tableParams.pagination"
        :header-row-class-name="'table-header'"
        @page-current-change="
          page =>
            handlePageChange(page, pageData.tableParams.pagination.pageSize)
        "
        @page-size-change="
          size =>
            handlePageChange(pageData.tableParams.pagination.currentPage, size)
        "
        @expand-change="handleExpand"
      >
        <template #expand="{ row }">
          <div class="m-4">
            <PlusForm
              :key="row.id"
              v-model="expandedFormData[row.id].main"
              :disabled="expandedFormData[row.id].main.disabled"
              class="w-[80%] max-w-[1000px] m-auto"
              :columns="mainFormColumns"
              :rules="rules"
              label-position="right"
              @submit="handleMainFormSubmit"
              @reset="() => handleMainFormReset(row.id)"
              submitText="提交主表单"
              resetText="重置主表单"
              style="display: flex; flex-direction: column; align-items: center"
            />
            <el-collapse
              v-model="rowActiveNames[row.id]"
              class="w-[360px]"
              :accordion="true"
              @change="(val: CollapseModelValue) => handleCollapseChange(val, row.id)"
              style="
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 100%;
                margin-top: 20px;
              "
            >
              <el-collapse-item title="一般资料" name="1" style="width: 100%">
                <template v-if="rowDataLoading[row.id]?.general">
                  <el-skeleton :rows="3" animated />
                </template>
                <template v-else>
                  <GeneralInfo
                    :row-id="row.id"
                    v-model:form-data="expandedFormData[row.id].general"
                    v-model:is-editing="editState.general[row.id]"
                    :permissions="pageData.permission"
                  />
                </template>
              </el-collapse-item>

              <el-collapse-item title="病历资料" name="2" style="width: 100%">
                <template v-if="rowDataLoading[row.id]?.case">
                  <el-skeleton :rows="3" animated />
                </template>
                <template v-else>
                  <CaseInfo
                    :row-id="row.id"
                    v-model:form-data="expandedFormData[row.id].case"
                    v-model:is-editing="editState.case[row.id]"
                    :permissions="pageData.permission"
                  />
                </template>
              </el-collapse-item>
            </el-collapse>
          </div>
        </template>

        <template #roleType="{ row }">
          <el-tag
            effect="plain"
            :type="enabledBooleanConvert(row.isSystem) ? 'danger' : ''"
          >
            {{ enabledBooleanConvert(row.isSystem) ? "内置" : "自定义" }}
          </el-tag>
        </template>

        <template #roleEnable="{ row }">
          <el-tag effect="plain" :type="row.enabled === 1 ? 'success' : 'info'">
            {{ enableConvert(row.enabled) }}
          </el-tag>
        </template>

        <template #operation="{ row }">
          <el-link
            v-show="hasAuth(pageData.permission.update) && row.isSystem !== 1"
            type="primary"
            @click="handleEdit(row, 'main')"
          >
            {{ editState.main[row.id] ? "退出编辑" : "编辑" }}
          </el-link>
          <el-divider
            v-show="hasAuth(pageData.permission.delete) && row.isSystem !== 1"
            direction="vertical"
          />
          <el-link
            v-show="hasAuth(pageData.permission.delete) && row.isSystem !== 1"
            type="primary"
            @click="handleDel(row)"
          >
            删除
          </el-link>
        </template>
      </pure-table>

      <patient-edit ref="patientEditRef" @ok="loadTableData" />
    </template>
  </el-card>
</template>

<style scoped>
::v-deep .el-form-item__label {
  width: 160px !important;
}

::v-deep .el-row {
  width: 100% !important;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
</style>
