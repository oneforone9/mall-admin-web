<template>
  <div class="app-container">
    <el-container>
      <el-header>
        <div style="float: right;">
          <el-button v-show="disabledAll" size="small" type="primary" @click="add">新增</el-button>
          <el-button v-show="disabledAll" size="small" type="primary" @click="edit">修改</el-button>
          <el-button v-show="disabledAll"  size="small" type="danger" @click="delRole">删除</el-button>
          <el-button v-show="!disabledAll" size="small" type="primary" @click="cancel">取消</el-button>
          <el-button v-show="!disabledAll" size="small" type="primary" @click="save">保存</el-button>
        </div>
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
              <template slot-scope="scope">
                  <el-input v-model="scope.row.name" :disabled="scope.row.disabled" class="edit-input" />
              </template>
            </el-table-column>
            <el-table-column label="角色描述" width="180" align="center">
              <template slot-scope="scope">
                <el-input v-model="scope.row.description" :disabled="scope.row.disabled"  class="edit-input" />
              </template>
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
  import {fetchRoles,fetchPermissions,fetchPermissonByRole,updatePermissionByRole,createRole,deleteRole} from '@/api/ums'
  const R = (f, s) => s.map(i => (f(i), i.children && i.children.length ? R(f, i.children) : 0, i))
  export default {
    name:'rolePermission',
    data() {
      return {
        currentRow:null,
        currentNum:0,
        roles:[],
        permissions:[],
        rolePermissions:[],
        disabledAll:true,
        defaultProps: {
          children: 'children',
          label: 'name'
        },
        listLoading:false,
        rules: {
          name: [
            { required: true, message: '请输入角色名称', trigger: 'blur' },
          ],
          description: [
            { required: true, message: '请输入角色描述', trigger: 'change' }
          ]
        }
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
          this.chageTableDisable()
        });
      },
      chageTableDisable(){
        this.roles.forEach((item,index)=>{
          item.disabled = true
          // if(!this.disabledAll && item.id == this.currentRow.id){
          //   item.disabled = false
          //   this.$set(this.roles,index,item)
          // }
        })
      },
      getPermissions(){
        this.listLoading=true;
        fetchPermissions().then(response => {
          this.listLoading = false;
          this.permissions = response.data
        });
      },
      handleRoleChange(row,oldRow){
        if(!this.disabledAll && row.id!=oldRow.id){
          // this.$message({
          //   message: '请先保存当前的角色',
          //   type: 'warning',
          //   duration: 1000
          // });
          // this.$refs.singleTable.setCurrentRow(oldRow);
          // return;
        }
        this.getPermissonByRole(row.id)
        this.currentRow = row
        // this.currentNum = index
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
      add(){
        this.disabledAll = false
        var child = {
          name:'',
          description:'',
          disabled:false
        }

        this.roles=[]
        this.roles.push(child)
        this.currentRow = child
        this.$refs.tree.setCheckedKeys([]);
      },
      edit(){
        if(this.currentRow != null){
          this.disabledAll = false
          this.currentRow.disabled = true
          this.roles = []
          this.roles.push(this.currentRow)
          this.currentRow.disabled = false
          this.$set(this.roles,1,item)
        }else{
          this.$message({
            message: '请选择要操作的角色',
            type: 'warning',
            duration: 1000
          });
          return;
        }
      },
      cancel(){
        this.disabledAll = true
        this.getRoles()
        // this.roles.forEach((item,index)=>{
        //   if(item.id == this.currentRow.id){
        //     item.disabled = true
        //     this.$set(this.roles,index,item)
        //   }
        // })
        // this.roles[this.currentRow-1].disabled=true
      // else if(this.disabledAll && item.id == this.currentRow.id){
      //     item.disabled = true
      //     this.$set(this.roles,index,item)
      //   }
      },
      delRole(){
        if(this.currentRow != null){
          this.$confirm('是否要删除该角色', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            let data = new URLSearchParams();
            data.append("ids",this.currentRow.id);
            deleteRole(data).then(response=>{
              this.$message({
                message: '删除成功',
                type: 'success',
                duration:1000
              });
              this.getRoles();
            });
          });
        }else{
          this.$message({
            message: '请选择要操作的角色',
            type: 'warning',
            duration: 1000
          });
          return;
        }
      },
      save(){
        if(this.currentRow.name==null || this.currentRow.name==''){
          this.$message({
            message: '角色名称不能为空',
            type: 'warning',
            duration: 1000
          });
          return;
        }
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
        data.append("role", JSON.stringify(this.currentRow));
        data.append("permissionIds", selectKeys);
        if(this.currentRow.id){
          updatePermissionByRole(data).then(response =>{
            this.$message({
              message: '保存成功',
              type: 'success',
              duration: 1000
            });
            this.$refs.tree.setCheckedKeys(selectKeys);
            this.disabledAll = true
            this.getRoles()
          })
        }else{
          createRole(data).then(response =>{
            this.$message({
              message: '保存成功',
              type: 'success',
              duration: 1000
            });
            this.$refs.tree.setCheckedKeys(selectKeys);
            this.disabledAll = true
            this.getRoles()
          })
        }
      }
    }
  }
</script>
