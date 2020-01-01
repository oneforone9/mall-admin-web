<template>
  <div class="app-container">
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets" style="margin-top: 5px"></i>
      <span style="margin-top: 5px">数据列表</span>
      <el-button
        class="btn-add"
        @click="addUser()"
        size="mini">
        添加
      </el-button>
    </el-card>
    <div class="table-container">
      <el-table ref="returnApplyTable"
                :data="list"
                style="width: 100%;"
                v-loading="listLoading" border>
        <el-table-column type="selection" width="60" align="center"></el-table-column>
        <el-table-column label="用户账号" width="180" align="center">
          <template slot-scope="scope">{{scope.row.username}}</template>
        </el-table-column>
        <el-table-column label="昵称" width="180" align="center">
          <template slot-scope="scope">{{scope.row.nickName}}</template>
        </el-table-column>
        <el-table-column label="邮箱" align="center">
          <template slot-scope="scope">{{scope.row.email}}</template>
        </el-table-column>
        <el-table-column label="备注信息" width="180" align="center">
          <template slot-scope="scope">{{scope.row.note}}</template>
        </el-table-column>
        <el-table-column label="启用状态" width="180" align="center">
          <template slot-scope="scope">{{scope.row.status | formatStatus}}</template>
        </el-table-column>
        <el-table-column label="创建时间" width="180" align="center">
          <template slot-scope="scope">{{scope.row.createTime | formatTime}}</template>
        </el-table-column>
        <el-table-column label="操作" width="300" align="center">
          <template slot-scope="scope">
            <el-button
              size="mini"
              @click="handleUpdate(scope.$index, scope.row)">编辑
            </el-button>
            <el-button
              size="mini"
              @click="handleRole(scope.$index, scope.row)">分配
            </el-button>
            <el-button
              size="mini"
              type="danger"
              @click="handleDelete(scope.$index, scope.row)">删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="30%">
      <el-form ref="userForm":model="user" :rules="rules" label-width="120px">
        <el-form-item label="账号" prop="username">
          <el-input v-model="user.username" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="昵称" prop="nickName">
          <el-input v-model="user.nickName" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="this.dialogTitle=='添加用户'">
          <el-input v-model="user.password" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="user.email" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="note">
          <el-input v-model="user.note" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleConfirm('userForm')">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="分配角色"
      :visible.sync="roledialog"
      width="50%">
      <el-select v-model="powerRoles" multiple placeholder="请选择" width="30%">
        <el-option
          v-for="item in roles"
          :key="item.id"
          :label="item.name"
          :value="item.id">
        </el-option>
      </el-select>
      <span slot="footer" class="dialog-footer">
        <el-button @click="roledialog = false">取 消</el-button>
        <el-button type="primary" @click="assignRole()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
  import {formatDate} from '@/utils/date';
  import {fetchUsers,fetchRoles,createAdmin,updateAdmin,deleteAdmin,fetchRolesByAdmin,updateRolesByAdmin} from '@/api/ums'
  export default {
    name:'returnUserList',
    data() {
      return {
        list:null,
        listLoading:false,
        dialogVisible: false,
        roledialog:false,
        powerRoles:[],
        roles:[],
        user:{},
        dialogTitle:'',
        rules: {
          username: [{ required: true, message: '请输入账号', trigger: 'blur' }, { pattern: /^\S*$/, message: '账号不能包含空格', trigger: 'blur' }],
          password:[{ required: true, message: '请输入密码', trigger: 'blur' }],
          email: [{ pattern: /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/, message: '请输入正确的邮箱', trigger: 'blur' }]
        }
      }
    },
    created(){
      this.getUsers();
      this.getRoles()
    },
    filters:{
      formatStatus(status){
        if(status == '1'){
          return "启用"
        }else{
          return "禁用"
        }
      },
      formatTime(time) {
        if(time==null||time===''){
          return 'N/A';
        }
        let date = new Date(time);
        return formatDate(date, 'yyyy-MM-dd hh:mm:ss')
      }
    },
    methods:{
      getUsers(){
        this.listLoading=true;
        fetchUsers().then(response => {
          this.listLoading = false;
          this.list = response.data.list;
        });
      },
      getRoles(){
        this.listLoading=true;
        fetchRoles().then(response => {
          this.listLoading = false;
          this.roles = response.data;
        });
      },
      addUser() {
        this.user ={}
        this.dialogVisible = true;
        this.dialogTitle = "添加用户";
      },
      handleDelete(index, row) {
        this.$confirm('是否要删除该用户', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteAdmin(row.id).then(response=>{
            this.$message({
              message: '删除成功',
              type: 'success',
              duration:1000
            });
            this.getUsers();
          });
        });
      },
      handleUpdate(index, row) {
        this.dialogVisible = true;
        this.dialogTitle = "编辑用户";
        this.user = row;
      },
      handleConfirm(formName){
        this.$refs[formName].validate((valid) => {
          if (valid) {
            if(this.dialogTitle==="添加用户"){
              createAdmin(this.user).then(response=>{
                this.$message({
                  message: '添加成功',
                  type: 'success',
                  duration:1000
                });
                this.dialogVisible = false;
                this.getUsers();
              });
            }else{
              updateAdmin(this.user.id,this.user).then(response=>{
                this.$message({
                  message: '修改成功',
                  type: 'success',
                  duration:1000
                });
                this.dialogVisible = false;
                this.getUsers();
              });
            }
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      handleRole(index,row){
        this.user = row
        fetchRolesByAdmin(row.id).then(response=>{
          this.roledialog = true
          this.powerRoles = []
          response.data.forEach((item)=>{
            this.powerRoles.push(item.id)
          })
        });
      },
      assignRole(){
        var data = new URLSearchParams();
        data.append("adminId", this.user.id);
        data.append("roleIds",  this.powerRoles);
        updateRolesByAdmin(data).then(response=>{
          this.$message({
            message: '分配成功',
            type: 'success',
            duration:1000
          });
          this.roledialog = false
          this.getUsers();
        });
      }
    }
  }
</script>
