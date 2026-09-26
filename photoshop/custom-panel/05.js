<script>
$(function() {
    $(".tab li").click(function() {
        var index = $(".tab li").index(this);
        $(".tabContent").removeClass('active');
        $(".tabContent").eq(index).addClass('active');
        $(".tab li").removeClass('active');
        $(this).addClass('active');
    });
});
</script>
