<template>
  <div class="app-container">
    <el-container>
      <el-header>
        <el-button v-show="disabledAll" style="float: right;margin-top: 10px;" size="small" type="primary" @click="assign">分配</el-button>
        <el-button v-show="!disabledAll" style="float: right;margin-top: 10px;" size="small" type="primary" @click="disabledAll = true">取消</el-button>
        <el-button v-show="!disabledAll" style="float: right;margin-top: 10px;" size="small" type="primary" @click="save">保存</el-button>
      </el-header>
      <el-container>
        <el-aside width="40%">
          <el-table ref="returnApplyTable"
                    :data="roles"
                    highlight-current-row
                    v-loading="listLoading" border
                    @current-change="handleRoleChange">
            <el-table-column type="index" width="40"  align="center" />
            <el-table-column label="角色名称" width="180" align="center">
              <template slot-scope="scope">{{scope.row.name}}</template>
            </el-table-column>
            <el-table-column label="角色描述" width="180" align="center">
              <template slot-scope="scope">{{scope.row.description}}</template>
            </el-table-column>
          </el-table>
        </el-aside>
        <el-main>
          <el-tree
            ref="tree"
            :data="filtedData"
            show-checkbox
            node-key="id"
            :disabled="disabledAll"
            :default-checked-keys="rolePermissions"
            :props="defaultProps">
          </el-tree>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>
<script>
  import {fetchRoles,fetchPermissions,fetchPermissonByRole,updatePermissionByRole} from '@/api/ums'
  const R = (f, s) => s.map(i => (f(i), i.children && i.children.length ? R(f, i.children) : 0, i))
  export default {
    name:'rolePermission',
    data() {
      return {
        currentRow:null,
        roles:[],
        permissions:[],
        rolePermissions:[],
        disabledAll:true,
        defaultProps: {
          children: 'children',
          label: 'name'
        },
        listLoading:false,
      }
    },
    computed: {
      filtedData() {
        if (this.disabledAll) {
          // 包装，启用 _disabled 存储 disabled
          return R(i => {
            if (i._disabled === undefined) {
              i._disabled = i.disabled === undefined ? false : i.disabled
            }
            i.disabled = true
          }, this.permissions)
        } else {
          // 恢复 disabled，清理 _disabled
          R(i => {
            if (i._disabled !== undefined) {
              i.disabled = i._disabled
              delete i._disabled
            }
          }, this.permissions)
          return this.permissions
        }
      }
    },
    created(){
      this.getRoles()
      this.getPermissions();
    },
    methods:{
      getRoles(){
        this.listLoading=true;
        fetchRoles().then(response => {
          this.listLoading = false;
          this.roles = response.data;
        });
      },
      getPermissions(){
        this.listLoading=true;
        fetchPermissions().then(response => {
          this.listLoading = false;
          this.permissions = response.data
        });
      },
      handleRoleChange(row){
        this.getPermissonByRole(row.id)
        this.currentRow = row
      },
      getPermissonByRole(roleId){
        fetchPermissonByRole(roleId).then(response => {
          this.rolePermissions = []
          response.data.forEach((item)=>{
            this.rolePermissions.push(item.id)
          })
          console.log(this.rolePermissions)
          this.$refs.tree.setCheckedKeys(this.rolePermissions);
        });
      },
      assign(){
        this.disabledAll = false
      },
      save(){
        const selectKeys= this.$refs.tree.getCheckedKeys();
        var data = new URLSearchParams();
        data.append("roleId", this.currentRow.id);
        data.append("permissionIds", selectKeys);
        updatePermissionByRole(data).then(response =>{
          this.$message({
            message: '保存成功',
            type: 'success',
            duration: 1000
          });
          this.$refs.tree.setCheckedKeys(selectKeys);
          this.disabledAll = true
        })
      }
    }
  }
</script>
