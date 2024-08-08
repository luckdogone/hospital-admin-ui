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
import "plus-pro-components/es/components/form/style/css";
import { ElMessage } from "element-plus";

defineOptions({ name: "corePatient" });

// 引用和状态
const patientEditRef = ref();
// const currentRowId = ref(null);
const rowActiveNames = ref<{ [key: number]: CollapseModelValue }>({});
const rowDataLoading = ref<{
  [key: number]: { general: boolean; medical: boolean };
}>({});
const expandedFormData = reactive<{ [key: number]: any }>({});

// 页面数据
const pageData: any = reactive({
  permission: {
    query: [],
    add: ["patient:save"],
    update: ["patient:update"],
    delete: ["patient:del"],
    general_update: ["general:update"]
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

// 模拟数据
const mockData = [
  {
    id: 1,
    name: "张三",
    sex: "男",
    age: 35,
    phone: "18888888888",
    contactPhone: "18555555555",
    address: "北京市朝阳区",
    inputStatus: "已完成",
    general: {},
    medical: {}
  },
  {
    id: 2,
    name: "李四",
    sex: "女",
    age: 28,
    phone: "18888888888",
    contactPhone: "18555555555",
    address: "上海市浦东新区",
    inputStatus: "进行中",
    general: {},
    medical: {}
  },
  {
    id: 3,
    name: "王五",
    sex: "男",
    age: 42,
    phone: "18888888888",
    contactPhone: "18555555555",
    address: "广州市天河区",
    inputStatus: "已完成"
  },
  {
    id: 4,
    name: "赵六",
    sex: "女",
    age: 31,
    phone: "18888888888",
    contactPhone: "18555555555",
    address: "深圳市南山区",
    inputStatus: "未开始"
  },
  {
    id: 5,
    name: "孙七",
    sex: "男",
    age: 50,
    phone: "18888888888",
    contactPhone: "18555555555",
    address: "成都市武侯区",
    inputStatus: "已完成"
  },
  {
    id: 6,
    name: "周八",
    sex: "女",
    age: 25,
    phone: "18888888888",
    contactPhone: "18555555555",
    address: "武汉市江汉区",
    inputStatus: "进行中"
  },
  {
    id: 7,
    name: "吴九",
    sex: "男",
    age: 38,
    phone: "18888888888",
    contactPhone: "18555555555",
    address: "西安市雁塔区",
    inputStatus: "已完成"
  },
  {
    id: 8,
    name: "郑十",
    sex: "女",
    age: 45,
    phone: "18888888888",
    contactPhone: "18555555555",
    address: "杭州市西湖区",
    inputStatus: "未开始"
  },
  {
    id: 9,
    name: "刘十一",
    sex: "男",
    age: 33,
    phone: "18888888888",
    contactPhone: "18555555555",
    address: "南京市玄武区",
    inputStatus: "进行中"
  },
  {
    id: 10,
    name: "陈十二",
    sex: "女",
    age: 29,
    phone: "18888888888",
    contactPhone: "18555555555",
    address: "重庆市渝中区",
    inputStatus: "已完成"
  }
];

// 一般资料模拟数据
// const mockGeneralData = [
//   {
//     id: 1,
//     surgicalNum: "A2024050501",
//     caseNo: "4110222555003"
//   },
//   {
//     id: 3,
//     surgicalNum: "A2024050501",
//     caseNo: "4110222555003"
//   }
// ];

// 病历资料模拟数据
const mockMedicalData = [
  {
    id: 3,
    admissionUltrasound: "未做",
    uSize: "",
    uBloodSignal: null
  },
  {
    id: 1,
    admissionUltrasound: "左",
    uSize: "10",
    uBloodSignal: "true"
  }
];

// 表单验证规则
const rules = {
  name: [{ required: true, message: "请输入名称" }]
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

// 一般资料表单列定义
const generalFormColumns: PlusColumn[] = [
  {
    label: "手术编号",
    width: 120,
    prop: "surgicalNum",
    valueType: "copy",
    tooltip: "A + 手术日期 + 数字",
    colProps: { span: 12 },
    fieldProps: {
      placeholder: "请输入手术编号" // 直接设置placeholder
    }
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

// 生成病历资料表单列
const generateMedicalColumns = (rowId: number): PlusColumn[] => {
  const row = expandedFormData[rowId];
  const isDisabled =
    !row ||
    !row.medical?.admissionUltrasound ||
    row.medical.admissionUltrasound === "未做";

  return [
    {
      label: "入院超声",
      width: 120,
      prop: "admissionUltrasound",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择状态"
      },
      options: [
        { label: "未做", value: "未做", color: "red" },
        { label: "左", value: "左", color: "blue" },
        { label: "右", value: "右", color: "yellow" },
        { label: "双侧", value: "双侧", color: "green" }
      ]
    },
    {
      label: "大小/cm",
      width: 120,
      prop: "uSize",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入大小",
        disabled: isDisabled
      }
    },
    {
      label: "血流信号",
      width: 120,
      prop: "uBloodSignal",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择",
        disabled: isDisabled
      },
      options: [
        { label: "有", value: "true", color: "red" },
        { label: "无", value: "false", color: "blue" }
      ]
    },
    {
      label: "BIRADS",
      width: 120,
      prop: "uBirads",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入类别",
        disabled: isDisabled
      }
    }
  ] as PlusColumn[];
};

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

const handleEdit = (data: any) => {
  patientEditRef.value?.open(data, "修改患者信息");
};

const handleFormChange = (
  values: FieldValues,
  column: PlusColumn,
  rowId: number
) => {
  console.log(values, column, "change");
  if (column.prop === "admissionUltrasound") {
    const medicalData = expandedFormData[rowId].medical;
    if (
      !medicalData.admissionUltrasound ||
      medicalData.admissionUltrasound === "未做"
    ) {
      medicalData.uSize = "";
      medicalData.uBloodSignal = "";
      medicalData.uBirads = "";
    }
    expandedFormData[rowId] = { ...expandedFormData[rowId] };
  }
};

// const handleSubmit = (values: FieldValues) => {
//   console.log(values, "Submit");
// };

// const handleSubmitError = (err: any) => {
//   console.log(err, "err");
// };

// 处理表单重置
// const handleReset = (rowId: number) => {
//   console.log("handleReset for row:", rowId);
//   // 重置当前行的数据，但保留 id
//   const id = expandedFormData[rowId].id;
//   expandedFormData[rowId] = { id, general: {}, medical: {} };
//   // 重新加载一般资料和病历资料
//   loadGeneralData(rowId);
//   loadMedicalData(rowId);
// };

// 处理重置
// const handleReset = (rowId: number, type: "general" | "medical"): void => {
//   if (!editState[type][rowId]) {
//     ElMessage.warning("当前不处于编辑状态，无法重置");
//     return;
//   }
//   // 执行重置逻辑
//   console.log("handleReset for row:", rowId);
//   // 重置当前行的数据，但保留 id
//   const id = expandedFormData[rowId].id;
//   expandedFormData[rowId] = { id, general: {}, medical: {} };
//   // 重新加载一般资料和病历资料
//   loadGeneralData(rowId);
//   loadMedicalData(rowId);
// };

// 处理折叠面板变化
const handleCollapseChange = (val: CollapseModelValue, rowId: number) => {
  rowActiveNames.value[rowId] = val;
  if (Array.isArray(val)) {
    if (val.includes("1") && !expandedFormData[rowId].general.surgicalNum) {
      loadGeneralData(rowId);
    }
    if (
      val.includes("2") &&
      !expandedFormData[rowId].medical.admissionUltrasound
    ) {
      loadMedicalData(rowId);
    }
  }
};

// 加载一般资料
const loadGeneralData = (id: number) => {
  if (!rowDataLoading.value[id]) {
    rowDataLoading.value[id] = { general: false, medical: false };
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
          caseNo: generalData.caseNo
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
const loadMedicalData = (id: number) => {
  if (!rowDataLoading.value[id]) {
    rowDataLoading.value[id] = { general: false, medical: false };
  }
  rowDataLoading.value[id].medical = true;
  // 使用 setTimeout 模拟异步加载
  setTimeout(() => {
    const medicalData = mockMedicalData.find(item => item.id === id) || {};
    expandedFormData[id] = {
      ...expandedFormData[id],
      medical: { ...medicalData }
    };
    rowDataLoading.value[id].medical = false;
  }, 1000);
};

// 处理展开/折叠
const handleExpand = (row: any, expanded: boolean) => {
  if (expanded) {
    if (!expandedFormData[row.id]) {
      expandedFormData[row.id] = {
        main: { ...row },
        general: {},
        medical: {}
      };
    }
    if (!rowActiveNames.value[row.id]) {
      rowActiveNames.value[row.id] = [];
    }
    if (!rowDataLoading.value[row.id]) {
      rowDataLoading.value[row.id] = { general: false, medical: false };
    }
    // 当展开行时，立即加载数据
    loadGeneralData(row.id);
    loadMedicalData(row.id);
  }
};

// 编辑状态
const editState = reactive({
  general: {} as { [key: number]: boolean },
  medical: {} as { [key: number]: boolean }
});

// 权限检查函数（示例）
const checkEditPermission = (type: string): boolean => {
  // 检查当前用户是否有 general_update 权限
  if (type === "general") {
    return hasAuth(pageData.permission.general_update);
  } else {
    // 其他类型的权限检查逻辑
    return true; // 假设用户有权限
  }
};

// 处理编辑按钮点击
const handleGeneralEdit = (
  rowId: number,
  type: "general" | "medical"
): void => {
  if (checkEditPermission(type)) {
    editState[type][rowId] = !editState[type][rowId];
  } else {
    // 显示无权限提示
    ElMessage.error("您没有编辑权限");
  }
};

// 模拟API调用
const someApiCall = async (values: FieldValues) => {
  // 这里应该是实际的API调用
  console.log("API call with values:", values);
  return new Promise(resolve => setTimeout(resolve, 1000));
};

// 处理提交
// const handleSubmit = async (values: FieldValues): Promise<void> => {
//   try {
//     // 获取当前编辑的行ID和类型
//     const rowId =
//       Object.keys(editState.general).find(
//         id => editState.general[Number(id)]
//       ) ||
//       Object.keys(editState.medical).find(id => editState.medical[Number(id)]);
//     const type = editState.general[Number(rowId)] ? "general" : "medical";

//     if (!rowId || !type) {
//       throw new Error("无法确定当前编辑的行或类型");
//     }

//     if (!editState[type][Number(rowId)]) {
//       ElMessage.warning("当前不处于编辑状态，无法提交");
//       return;
//     }

//     console.log(values, "Submit");
//     // 尝试提交
//     await someApiCall(values);
//     // 提交成功后，退出编辑状态
//     editState[type][Number(rowId)] = false;
//     ElMessage.success("提交成功");
//   } catch (error) {
//     console.error("提交失败", error);
//     ElMessage.error("提交失败，请重试");
//   }
// };

// 主表单处理函数
const handleMainFormSubmit = async (values: FieldValues): Promise<void> => {
  // try {
  //   console.log("主表单提交:", values);
  //   await someApiCall(values);
  //   ElMessage.success("主表单提交成功");
  // } catch (error) {
  //   console.error("主表单提交失败", error);
  //   ElMessage.error("主表单提交失败，请重试");
  // }
  // pageData.formParam.loading = true;
  // patientApi
  //   .patientUpdate(values.id, values)
  //   .then(res => {
  //     if (res.success) {
  //       ElMessage.success("主表单提交成功");
  //     } else {
  //       console.error("主表单提交失败", res.message);
  //       ElMessage.error("主表单提交失败，请重试");
  //     }
  //   })
  //   .finally(() => {
  //     pageData.formParam.loading = false;
  //   });
  pageData.tableParams.loading = true;

  // 将 id 转换为字符串
  const id = String(values.id);
  console.log(id);
  // 创建一个新的对象，排除 id 字段
  const { id: _, ...updateData } = values;

  patientApi
    .patientUpdate(id, updateData)
    .then(res => {
      if (res.success) {
        ElMessage.success("主表单提交成功");
        // 更新本地数据
        expandedFormData[id].main = { ...values };
        // 可能需要重新加载表格数据
        loadTableData();
      } else {
        throw new Error(res.message || "未知错误");
      }
    })
    .catch(error => {
      console.error("主表单提交失败", error);
      ElMessage.error(`主表单提交失败：${error.message || "请重试"}`);
    })
    .finally(() => {
      pageData.tableParams.loading = false;
    });
};

// 修改主表单重置函数
const handleMainFormReset = (rowId: number): void => {
  console.log("重置主表单，行ID:", rowId);
  const originalData = mockData.find(item => item.id === rowId) || {};

  // 保存当前的子表单数据
  const currentGeneral = expandedFormData[rowId]?.general || {};
  const currentMedical = expandedFormData[rowId]?.medical || {};

  console.log(originalData);
  console.log(currentGeneral);
  console.log(currentMedical);

  // 重置主表单相关的字段
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

  // 创建一个新的对象来存储重置后的数据
  const resetData = {
    id: rowId,
    ...Object.fromEntries(
      mainFormFields.map(field => [field, originalData[field] || ""])
    ),
    general: currentGeneral,
    medical: currentMedical
  };

  // 更新 expandedFormData
  expandedFormData[rowId] = resetData;

  // 强制更新视图
  expandedFormData[rowId] = { ...resetData };
  console.log(expandedFormData[rowId]);
};

// 一般资料表单处理函数
const handleGeneralFormSubmit = async (
  values: FieldValues,
  rowId: number
): Promise<void> => {
  try {
    console.log("一般资料表单提交:", values);
    await someApiCall(values);
    editState.general[rowId] = false;
    ElMessage.success("一般资料提交成功");
  } catch (error) {
    console.error("一般资料提交失败", error);
    ElMessage.error("一般资料提交失败，请重试");
  }
};

// 修改一般资料表单重置函数
const handleGeneralFormReset = (rowId: number): void => {
  if (!editState.general[rowId]) {
    ElMessage.warning("当前不处于编辑状态，无法重置");
    return;
  }
  console.log("重置一般资料表单，行ID:", rowId);
  // 直接重置一般资料相关的字段
  expandedFormData[rowId].general = {
    surgicalNum: "",
    caseNo: ""
  };
};

// 病历资料表单处理函数
const handleMedicalFormSubmit = async (
  values: FieldValues,
  rowId: number
): Promise<void> => {
  try {
    console.log("病历资料表单提交:", values);
    await someApiCall(values);
    editState.medical[rowId] = false;
    ElMessage.success("病历资料提交成功");
  } catch (error) {
    console.error("病历资料提交失败", error);
    ElMessage.error("病历资料提交失败，请重试");
  }
};

// 修改病历资料表单重置函数
const handleMedicalFormReset = (rowId: number): void => {
  if (!editState.medical[rowId]) {
    ElMessage.warning("当前不处于编辑状态，无法重置");
    return;
  }
  console.log("重置病历资料表单，行ID:", rowId);
  // 直接重置病历资料相关的字段
  expandedFormData[rowId].medical = {
    admissionUltrasound: "",
    uSize: "",
    uBloodSignal: null,
    uBirads: ""
  };
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
                  <div class="form-header">
                    <h3>一般资料</h3>
                    <el-button
                      @click="handleGeneralEdit(row.id, 'general')"
                      type="primary"
                      size="small"
                    >
                      {{ editState.general[row.id] ? "取消编辑" : "编辑" }}
                    </el-button>
                  </div>
                  <PlusForm
                    v-if="
                      expandedFormData[row.id] &&
                      expandedFormData[row.id].general
                    "
                    :key="`general-${row.id}`"
                    v-model="expandedFormData[row.id].general"
                    class="w-[80%] max-w-[1000px] m-auto"
                    :columns="generalFormColumns"
                    :rules="rules"
                    label-position="right"
                    @change="
                      (values, column) =>
                        handleFormChange(values, column, row.id)
                    "
                    :disabled="!editState.general[row.id]"
                    lazy
                    @submit="values => handleGeneralFormSubmit(values, row.id)"
                    @reset="() => handleGeneralFormReset(row.id)"
                    submitText="提交一般资料"
                    resetText="重置一般资料"
                    style="
                      display: flex;
                      flex-direction: column;
                      align-items: center;
                    "
                  />
                </template>
              </el-collapse-item>

              <el-collapse-item title="病历资料" name="2" style="width: 100%">
                <template v-if="rowDataLoading[row.id]?.medical">
                  <el-skeleton :rows="3" animated />
                </template>
                <template v-else>
                  <div class="form-header">
                    <h3>病历资料</h3>
                    <el-button
                      @click="handleGeneralEdit(row.id, 'medical')"
                      type="primary"
                      size="small"
                    >
                      {{ editState.medical[row.id] ? "取消编辑" : "编辑" }}
                    </el-button>
                  </div>
                  <PlusForm
                    v-if="
                      expandedFormData[row.id] &&
                      expandedFormData[row.id].medical
                    "
                    :key="`medical-${row.id}`"
                    v-model="expandedFormData[row.id].medical"
                    class="w-[80%] max-w-[1000px] m-auto"
                    :columns="generateMedicalColumns(row.id)"
                    :rules="rules"
                    label-position="right"
                    @change="
                      (values, column) =>
                        handleFormChange(values, column, row.id)
                    "
                    :disabled="!editState.medical[row.id]"
                    lazy
                    @submit="values => handleMedicalFormSubmit(values, row.id)"
                    @reset="() => handleMedicalFormReset(row.id)"
                    submitText="提交病历资料"
                    resetText="重置病历资料"
                    style="
                      display: flex;
                      flex-direction: column;
                      align-items: center;
                    "
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
            @click="handleEdit(row)"
          >
            编辑
          </el-link>
          <el-divider
            v-show="hasAuth(pageData.permission.delete) && row.isSystem !== 1"
            direction="vertical"
          />
          <el-link
            v-show="hasAuth(pageData.permission.delete) && row.isSystem !== 1"
            type="primary"
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
  width: 91px !important;
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
