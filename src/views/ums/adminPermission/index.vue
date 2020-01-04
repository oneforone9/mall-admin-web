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
          <el-table ref="returnUserTable"
                    :data="users"
                    highlight-current-row
                    v-loading="listLoading" border
                    @current-change="handleUserChange">
            <el-table-column type="index" width="40"  align="center" />
            <el-table-column label="用户账号" width="180" align="center">
              <template slot-scope="scope">{{scope.row.username}}</template>
            </el-table-column>
            <el-table-column label="用户昵称" width="180" align="center">
              <template slot-scope="scope">{{scope.row.nickname}}</template>
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
            :default-checked-keys="userPermissions"
            :props="defaultProps">
          </el-tree>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>
<script>
  import {fetchUsers,fetchPermissions,fetchPermissonByUser,updatePermissionByUser} from '@/api/ums'
  const R = (f, s) => s.map(i => (f(i), i.children && i.children.length ? R(f, i.children) : 0, i))
  export default {
    name:'userPermissions',
    data() {
      return {
        currentRow:null,
        users:[],
        permissions:[],
        userPermissions:[],
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
      this.getUsers()
      this.getPermissions();
    },
    methods:{
      getUsers(){
        this.listLoading=true;
        fetchUsers().then(response => {
          this.listLoading = false;
          this.users = response.data.list;
        });
      },
      getPermissions(){
        this.listLoading=true;
        fetchPermissions().then(response => {
          this.listLoading = false;
          this.permissions = response.data
        });
      },
      handleUserChange(row){
        this.getPermissonByUser(row.id)
        this.currentRow = row
      },
      getPermissonByUser(userId){
        fetchPermissonByUser(userId).then(response => {
          this.userPermissions = []
          response.data.forEach((item)=>{
            this.userPermissions.push(item.id)
          })
          this.$refs.tree.setCheckedKeys(this.userPermissions);
        });
      },
      assign(){
        this.disabledAll = false
      },
      save(){
        const selectKeys= this.$refs.tree.getCheckedKeys();
        if(selectKeys==null || selectKeys.length==0){
          this.$message({
            message: '请选择权限',
            type: 'warning',
            duration: 1000
          });
          return
        }
        var data = new URLSearchParams();
        data.append("adminId", this.currentRow.id);
        data.append("permissionIds", selectKeys);
        updatePermissionByUser(data).then(response =>{
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
