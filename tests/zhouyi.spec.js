// tests/zhouyi.spec.js
const { test, expect } = require('@playwright/test');

test.describe('周易查询网站测试', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('页面基础测试', () => {
    test('页面标题正确', async ({ page }) => {
      await expect(page).toHaveTitle(/易经与小六壬/);
    });

    test('页面主要元素存在', async ({ page }) => {
      // 检查标题
      await expect(page.locator('h1')).toContainText('易经与小六壬');
      
      // 检查两个标签页
      await expect(page.locator('#tab-zhouyi')).toBeVisible();
      await expect(page.locator('#tab-liuren')).toBeVisible();
      
      // 检查输入框
      await expect(page.locator('#upper')).toBeVisible();
      await expect(page.locator('#lower')).toBeVisible();
      await expect(page.locator('#moving')).toBeVisible();
      
      // 检查查询按钮
      await expect(page.locator('button:has-text("查询卦象")')).toBeVisible();
    });

    test('标签切换功能正常', async ({ page }) => {
      // 默认显示易经部分
      await expect(page.locator('#section-zhouyi')).not.toHaveClass(/hidden/);
      await expect(page.locator('#section-liuren')).toHaveClass(/hidden/);
      
      // 切换到小六壬
      await page.click('#tab-liuren');
      await expect(page.locator('#section-zhouyi')).toHaveClass(/hidden/);
      await expect(page.locator('#section-liuren')).not.toHaveClass(/hidden/);
      
      // 切换回易经
      await page.click('#tab-zhouyi');
      await expect(page.locator('#section-zhouyi')).not.toHaveClass(/hidden/);
      await expect(page.locator('#section-liuren')).toHaveClass(/hidden/);
    });
  });

  test.describe('易经卦象查询测试', () => {
    test('查询乾卦初爻', async ({ page }) => {
      // 输入乾卦（上1下1）初爻动
      await page.fill('#upper', '1');
      await page.fill('#lower', '1');
      await page.fill('#moving', '1');
      
      // 点击查询
      await page.click('button:has-text("查询卦象")');
      
      // 等待结果显示
      await expect(page.locator('#result')).not.toHaveClass(/hidden/);
      
      // 验证卦名
      await expect(page.locator('#gua-name')).toContainText('乾');
      
      // 验证卦结构
      await expect(page.locator('#gua-structure')).toContainText('上乾');
      await expect(page.locator('#gua-structure')).toContainText('下乾');
      
      // 验证核心动爻信息显示在最前面
      await expect(page.locator('#yao-main-display')).toContainText('乾卦');
      await expect(page.locator('#yao-main-display')).toContainText('初爻动');
      await expect(page.locator('#yao-main-display')).toContainText('象曰');
      
      // 验证卦辞存在
      await expect(page.locator('#gua-ci')).not.toBeEmpty();
      await expect(page.locator('#tuan-zhuan')).not.toBeEmpty();
      await expect(page.locator('#da-xiang')).not.toBeEmpty();
    });

    test('查询泰卦三爻', async ({ page }) => {
      // 泰卦：上坤(8)下乾(1)，三爻动
      await page.fill('#upper', '8');
      await page.fill('#lower', '1');
      await page.fill('#moving', '3');
      
      await page.click('button:has-text("查询卦象")');
      
      await expect(page.locator('#result')).not.toHaveClass(/hidden/);
      await expect(page.locator('#gua-name')).toContainText('泰');
      await expect(page.locator('#yao-main-display')).toContainText('泰卦');
      await expect(page.locator('#yao-main-display')).toContainText('三爻动');
    });

    test('查询复卦上爻', async ({ page }) => {
      // 复卦：上坤(8)下震(4)，上爻(6)动
      await page.fill('#upper', '8');
      await page.fill('#lower', '4');
      await page.fill('#moving', '6');
      
      await page.click('button:has-text("查询卦象")');
      
      await expect(page.locator('#result')).not.toHaveClass(/hidden/);
      await expect(page.locator('#gua-name')).toContainText('复');
      await expect(page.locator('#yao-main-display')).toContainText('复卦');
      await expect(page.locator('#yao-main-display')).toContainText('上爻动');
    });

    test('输入验证 - 空值提示', async ({ page }) => {
      // 不输入直接点击
      page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('请填写完整的卦爻信息');
        await dialog.accept();
      });
      
      await page.click('button:has-text("查询卦象")');
    });

    test('输入验证 - 超出范围', async ({ page }) => {
      // 输入超出范围的值
      await page.fill('#upper', '9');
      await page.fill('#lower', '1');
      await page.fill('#moving', '1');
      
      page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('1-8之间');
        await dialog.accept();
      });
      
      await page.click('button:has-text("查询卦象")');
    });

    test('展开全卦爻辞', async ({ page }) => {
      // 先查询一个卦
      await page.fill('#upper', '1');
      await page.fill('#lower', '1');
      await page.fill('#moving', '1');
      await page.click('button:has-text("查询卦象")');
      
      // 等待结果
      await expect(page.locator('#result')).not.toHaveClass(/hidden/);
      
      // 点击展开全卦
      await page.click('button:has-text("查看全卦六爻")');
      
      // 验证全卦内容显示
      await expect(page.locator('#all-yao')).not.toHaveClass(/hidden/);
      
      // 验证有6个爻
      const yaoItems = page.locator('#all-yao > div');
      await expect(yaoItems).toHaveCount(6);
    });
  });

  test.describe('小六壬测试', () => {
    test('小六壬界面元素', async ({ page }) => {
      await page.click('#tab-liuren');
      
      // 检查输入框
      await expect(page.locator('#liuren-1')).toBeVisible();
      await expect(page.locator('#liuren-2')).toBeVisible();
      await expect(page.locator('#liuren-3')).toBeVisible();
      
      // 检查按钮
      await expect(page.locator('button:has-text("起卦推算")')).toBeVisible();
      
      // 检查六神说明
      await expect(page.locator('text=大安')).toBeVisible();
      await expect(page.locator('text=留连')).toBeVisible();
      await expect(page.locator('text=速喜')).toBeVisible();
    });

    test('小六壬计算 - 速喜', async ({ page }) => {
      await page.click('#tab-liuren');
      
      // 输入数字计算速喜 (1+1+2-2)%6 = 2 -> 速喜
      await page.fill('#liuren-1', '1');
      await page.fill('#liuren-2', '1');
      await page.fill('#liuren-3', '2');
      
      await page.click('button:has-text("起卦推算")');
      
      // 验证结果显示
      await expect(page.locator('#liuren-result')).not.toHaveClass(/hidden/);
      await expect(page.locator('#liuren-god')).toContainText('速喜');
    });

    test('小六壬计算 - 空亡', async ({ page }) => {
      await page.click('#tab-liuren');
      
      // 输入测试数据
      await page.fill('#liuren-1', '6');
      await page.fill('#liuren-2', '6');
      await page.fill('#liuren-3', '6');
      
      await page.click('button:has-text("起卦推算")');
      
      await expect(page.locator('#liuren-result')).not.toHaveClass(/hidden/);
      // 验证结果不为空
      await expect(page.locator('#liuren-god')).not.toBeEmpty();
      await expect(page.locator('#liuren-desc')).not.toBeEmpty();
    });
  });

  test.describe('响应式布局测试', () => {
    test('移动端显示正常', async ({ page }) => {
      // 设置移动端视口
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      
      // 验证主要元素仍然可见
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('#upper')).toBeVisible();
      await expect(page.locator('#lower')).toBeVisible();
      await expect(page.locator('#moving')).toBeVisible();
    });

    test('平板端显示正常', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload();
      
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('#tab-zhouyi')).toBeVisible();
      await expect(page.locator('#tab-liuren')).toBeVisible();
    });
  });
});
