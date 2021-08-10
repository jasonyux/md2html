---
title: SpringBoot Projects
date: 2021-03-11 22:39:49
tags: null
---

This is used to record some useful code/tricks I had with using **Spring Boot** for backend application.

# Xuezhang EDU

Project information: Secret

## Conditional Application Properties

Basically, this is **commonly** used to enable **profile-specific** `application.properties`.

- in this example, I am using `application.yml` because I think it is more succinct

In short, the **idea** is as follows:

1. the `application.yml` will be the *main entry point*. Here, it will load itself **AND** *load other `application-<profile>.yml`* 
   - I need to tell it *which profile to use* by specifying `spring.profiles.active=<profile>`
2. put some profile specific environmental settings/variable inside the `application-<profile>.yml`

*For Example*:

Inside `application.yml`

```yml
debug: true
spring:
  profiles:
    active: dev
```

where:

- this will basically load itself, and load `application-dev.yml` (which **will override overlapping configurations**)

Then, inside `application-dev.yml`:

```yml
spring:
  datasource:
  # some tcode omitted here
```

> **Note**
>
> - If you are having a `application-deploy.yml` or something similar, such that it technically *does not "compile"* on your local machine as it *does not pass the tests* (e.g. the *database connection configuration might be different*), then you might find the following helpful:
>
>   ```bash
>   mvn package -Dmaven.test.skip=true
>   ```
>
>   which would `package` your code **by skipping the testing stage** (do this only when you are 100% sure your code/configuration is correct)

## Conditional Configuration

One thing I found handy is the `@ConditionalOnProperty` annotation, which can be used to:

- *conditionally* include a `Bean` into the project

> **Note**
>
> - There is a *family of methods* similar to `@ConditionalOnProperty`, for example, `@ConditionalOnExpression`, which might be useful as well.

*Example*

```java
@Configuration
@ConditionalOnProperty( 
        value="ajp.enabled",
        havingValue = "true")
/* loaded ONLY if I set ajp.enabled = true */
public class AJPConfig {
    @Value("${server.port}")
    private int serverPort;

    /* some code omitted here */
}
```

## Exception and Status Code

The idea is to `catch` an exception on the controller level, and then **handle it by customizing the `response`**.

One way to do this is via `@ControllerAdvicer` and `ResponseEntity<Object>`

1. create a class with `@CntrollerAdvicer`
2. create handlers per **exception/list of exceptions**

*For Example*

```java
@ControllerAdvice
public class ControllerAdviser extends ResponseEntityExceptionHandler {
    /* handles all exceptions of type SQLException */
    @ExceptionHandler(SQLException.class)
    public ResponseEntity<Object> handleSQLException(SQLException e, WebRequest request){
        return handleExceptionInternal(e,
                                       ResultResp.error("406", e.getLocalizedMessage()),
                                       new HttpHeaders(),
                                       HttpStatus.NOT_ACCEPTABLE, 
                                       request);
    }
}
```

where **notice** that:

- we needed to `extend ResponseEntityExceptionHandler` so that we can use the `handleExceptionInternal()` method
- we are specifying our own `responseBody` and `statusCode`:
  - the `ResultResp.error("406", e.getLocalizedMessage())` is actually an `Object`, and it is *converted to `json`* in the respsone
  - the status code is set via `HttpStatus.NOT_ACCEPTABLE` in the method

## File Upload and Download

Basically, I just need to utilize the `MultipartFile` class, and the `java.io` package to:

- *obtain* the file object
- *read* and/or *write* to a storage/request
  - use `transferTo()` for **saving file**
  - use `OutputStream.write()` for **writing file**

*For Example*:

**Uploading** a File:

- the actual project code is *changed a lot*. This is just a demonstration of how it should work

```java
@PostMapping("/testFileUpload")
public String test_file_upload(@RequestParam String filename, MultipartFile file){
    if(file.isEmpty()){
        return "empty file";
    }
    String fileName = file.getOriginalFilename();
    int size = (int) file.getSize();
    System.out.println(fileName + "-->" + size + filename);

    /* NOT GOOD CODE HERE. THIS IS ONLY FOR DEMONSTRATOIN PURPOSE */
    String path = "C:/Users/26238/Desktop";
    File dest = new File(path + "/" + fileName);
    
    if(!dest.getParentFile().exists()){
        dest.getParentFile().mkdir();
    }
    try {
        file.transferTo(dest); //saving file
        return "true";
    } catch (IllegalStateException e) {
        e.printStackTrace();
        return "false";
    } catch (IOException e) {
        e.printStackTrace();
        return "false";
    }
}
```

**Downloading** a File:

- the actual project code is *changed a lot*. This is just a demonstration of how it should work

```java
@GetMapping("/testFileDownload")
public String test_file_download(HttpServletResponse response) throws UnsupportedEncodingException {
    /* NOT GOOD CODE HERE. THIS IS ONLY FOR DEMONSTRATOIN PURPOSE */
    String filename="chest-man-14778839.png";
    String filePath = "C:/Users/26238/Desktop";
    File file = new File(filePath + "/" + filename);
    if(file.exists()){
        //response.setContentType("image/png"); /* optional */
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Content-Disposition", "attachment;fileName=" +   java.net.URLEncoder.encode(filename,"UTF-8"));
        byte[] buffer = new byte[1024];
        FileInputStream fis = null;
        BufferedInputStream bis = null;

        OutputStream os = null;
        try {
            os = response.getOutputStream();
            fis = new FileInputStream(file);
            bis = new BufferedInputStream(fis);
            int i = bis.read(buffer);
            while(i != -1){
                os.write(buffer);
                i = bis.read(buffer);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
        System.out.println("----------file download---" + filename);
        try {
            bis.close();
            fis.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    return null;
}
```

> *References*:
>
> - https://www.jianshu.com/p/be1af489551c

## SQL Related

This section discusses some SQL related code/configurations for this project.

### Transactions

This is obviously useful if we need some *multi-step inserts*, and we need basically some kind of rollback if one of the SQL statement failed.

- one way to deal with is to use `transactions`, which can be done either in code or via `procedure` in *database*

Here, I will demonstrate a **simple example** of enabling `@Transactional` in code

*For Example: All in or Nothing*

```java
@Transactional
public ResultResp createTeacher(Teacher teacherInfo) {
    User userInfo = teacherInfo;
    if (this.userMapper.createUserInfo(userInfo) == 0) {
        return ResultResp.error("failed to create User with uid:" + userInfo.getUid());
    }
    if (this.teacherMapper.createTeacherInfo(teacherInfo) == 0) {
        return ResultResp.error("failed to create Teacher with uid:" + teacherInfo.getUid());
    }
    return ResultResp.success(teacherInfo.getUid());
}
```

where:

- by using `@Transactional`, it essentially **wraps this method** around with a `BEGIN TRANSACTION` and `commit`. If any one statement failed, nothing is executed
- however, I *still needed to return to user some information*. Therefore, I need to check `rowsAffected` so that I can give back error messages correctly

### Insert and Fetch Generated ID

This comes often when you need to insert into a table, and then **obtain the generated ID** from that table to return.

- one way is to use the `RETURNING <col-name>` in the SQL statement
- below uses the MyBatis supported `useGeneratedKeys="true"`

*For Example*

Suppose you want to insert into a table called `Users`, and you want to **fetch the generated id `uid`**. 

The method signature looks like:

```java
int createUserInfo(@Valid @NotNull User user);
```

where:

- this `User user` will not only contain the `some_info` that you need to *insert into table*
- it will **also be used to store the generated ID** (see below)

Then, the mapper looks like

```xml
<insert id="createUserInfo" useGeneratedKeys="true" keyProperty="uid" keyColumn="uid">
    INSERT INTO Users (some_info)
    VALUES (#{some_info})
</insert>
```

where:

- the ` useGeneratedKeys="true" keyColumn="uid"` means the `uid` **column is generated**
- the `keyProperty="uid"` means that the **generated key will be filled into the `uid` field of the object passed in** .
  - i.e. you will be able to get the `uid` via `user.uid` after the insert

### Full Text Search and IN All

This is useful when I wanted to implement a search bar in my application. Instead of string matching using `LIKE`, using a FTS for MySQL would be more natural.

In short, I needed to:

- for MySQL database, add an `INDEX` of `FULLTEXT` to a column of `VARCHAR/CHAR` that I had
- If needed REGEX for matching, use `MATCH(<column>) AGAINST('<expression>' IN BOOLEAN MODE)`
- some other filters in addition to this (application specific)
  - one example I will show here is the *trick* of computing a data entry that is in ALL of the given `in`

> **Note**
>
> - According to some tutorials I have read, if the FTS would return 0 rows if the search key is ==less than 3 characters==

*For Example*

A full test search might look like:

```sql
SELECT * FROM `Users`
WHERE MATCH(username) AGAINST('xiao*' IN BOOLEAN MODE);
```

The actual MyBatis SQL

```xml
<select id="getBBBByFilters" resultMap="BBB">
    <choose>
        <when test="filter != null and filter.subjects != null">
            WITH SubjectFilter AS(
                SELECT ts.uid FROM AAA ts
                WHERE ts.subject_id IN
                <foreach collection="filter.subjects" item="item"
                         open="(" close=")" separator=",">
                    #{item.subject_id}
                </foreach>
                GROUP BY ts.uid
                HAVING COUNT(*) = ${filter.subjects.size}
            )
            SELECT t.* FROM BBB t
            JOIN SubjectFilter sf ON t.uid = sf.uid
        </when>
        <otherwise>
            SELECT * FROM BBB t
        </otherwise>
    </choose>

    <where>
        <if test="searchName != null and searchName != ''">
            MATCH(t.real_name) AGAINST(CONCAT(#{searchName}, '*') IN BOOLEAN MODE)
        </if>
        <!-- some other filters omitted here -->
    </where>
</select>
```